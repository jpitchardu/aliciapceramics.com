import { z } from "zod";
import type { SquareClient } from "square";

/*
 * "Tell me when the next class goes up": an email, nothing else. The
 * person lands in Square as a customer in the "class list" group, so
 * alicia sees them under customers and can email the whole group from
 * Square Marketing when new dates go live. The group is made the first
 * time anyone signs up, so there's nothing to set up by hand.
 */

export const CLASS_LIST_GROUP = "class list";

export const classListSchema = z.object({
  /* made once per form on the page — keeps retries idempotent */
  submissionId: z.uuid(),
  email: z.email("that email doesn't look right"),
  /* the class page they signed up from, or "classes" for the list */
  from: z.string().trim().max(60),
});
export type ClassListSignup = z.infer<typeof classListSchema>;

/* the group's id, made on first use. The fixed key means two people
 * signing up at the same moment both get the one group, not two. */
export async function findOrCreateGroup(client: SquareClient): Promise<string> {
  const page = await client.customers.groups.list();
  for await (const group of page) {
    if (group.name === CLASS_LIST_GROUP && group.id) return group.id;
  }
  const { group } = await client.customers.groups.create({
    idempotencyKey: "class-list-group",
    group: { name: CLASS_LIST_GROUP },
  });
  if (!group?.id) throw new Error("square returned no group");
  return group.id;
}

/* someone already in Square (a past booking, a commission) is reused, so
 * the list never makes a second customer for the same email */
export async function findOrCreateByEmail(
  client: SquareClient,
  s: ClassListSignup,
): Promise<string> {
  const email = s.email.trim().toLowerCase();
  const { customers = [] } = await client.customers.search({
    query: { filter: { emailAddress: { exact: email } } },
    limit: BigInt(1),
  });
  if (customers[0]?.id) return customers[0].id;

  const { customer } = await client.customers.create({
    idempotencyKey: `cl-${s.submissionId}-customer`,
    emailAddress: email,
    note: `class list — signed up from ${s.from}`,
  });
  if (!customer?.id) throw new Error("square returned no customer");
  return customer.id;
}

export async function addToClassList(
  client: SquareClient,
  s: ClassListSignup,
): Promise<{ customerId: string; groupId: string }> {
  const [groupId, customerId] = await Promise.all([
    findOrCreateGroup(client),
    findOrCreateByEmail(client, s),
  ]);
  // adding someone already in the group is a no-op in Square
  await client.customers.groups.add({ customerId, groupId });
  return { customerId, groupId };
}
