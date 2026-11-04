import { describe, expect, it, vi } from "vitest";
import type { SquareClient } from "square";
import {
  CLASS_LIST_GROUP,
  addToClassList,
  classListSchema,
  type ClassListSignup,
} from "@/lib/class-list";

const base: ClassListSignup = {
  submissionId: "5b0c9f8e-3c1a-4c7e-9a51-2f6f7d0b6e21",
  email: "Marisol@Example.com",
  from: "R2FCFTCOISQR7OMJIDHGEEYB",
};

/* groups.list returns an async-iterable page in the SDK */
const pageOf = <T>(items: T[]) => ({
  async *[Symbol.asyncIterator]() {
    yield* items;
  },
});

function fakeSquare({
  groups = [] as { id: string; name: string }[],
  customers = [] as { id: string }[],
} = {}) {
  const client = {
    customers: {
      search: vi.fn(async () => ({ customers })),
      create: vi.fn(async () => ({ customer: { id: "NEW_CUSTOMER" } })),
      groups: {
        list: vi.fn(async () => pageOf(groups)),
        create: vi.fn(async () => ({ group: { id: "NEW_GROUP" } })),
        add: vi.fn(async () => ({})),
      },
    },
  };
  return { client, square: client as unknown as SquareClient };
}

describe("class list signup", () => {
  it("wants a real email and a uuid", () => {
    expect(classListSchema.safeParse(base).success).toBe(true);
    expect(
      classListSchema.safeParse({ ...base, email: "not an email" }).success,
    ).toBe(false);
    expect(
      classListSchema.safeParse({ ...base, submissionId: "x" }).success,
    ).toBe(false);
  });

  it("makes the group and the customer the first time", async () => {
    const { client, square } = fakeSquare();
    const ids = await addToClassList(square, base);

    expect(client.customers.groups.create).toHaveBeenCalledWith({
      idempotencyKey: "class-list-group",
      group: { name: CLASS_LIST_GROUP },
    });
    expect(client.customers.create).toHaveBeenCalledWith(
      expect.objectContaining({
        emailAddress: "marisol@example.com",
        idempotencyKey: `cl-${base.submissionId}-customer`,
      }),
    );
    expect(client.customers.groups.add).toHaveBeenCalledWith({
      customerId: "NEW_CUSTOMER",
      groupId: "NEW_GROUP",
    });
    expect(ids).toEqual({ customerId: "NEW_CUSTOMER", groupId: "NEW_GROUP" });
  });

  it("reuses the existing group and an existing customer", async () => {
    const { client, square } = fakeSquare({
      groups: [
        { id: "APPTS", name: "Appointments" },
        { id: "LIST", name: CLASS_LIST_GROUP },
      ],
      customers: [{ id: "OLD_CUSTOMER" }],
    });
    await addToClassList(square, base);

    expect(client.customers.groups.create).not.toHaveBeenCalled();
    expect(client.customers.create).not.toHaveBeenCalled();
    expect(client.customers.groups.add).toHaveBeenCalledWith({
      customerId: "OLD_CUSTOMER",
      groupId: "LIST",
    });
  });
});
