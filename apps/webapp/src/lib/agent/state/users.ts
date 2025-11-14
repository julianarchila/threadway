import { convexClient } from "@/lib/convex";
import { api } from "@threadway/backend/convex/api";

type GetCurrentUserParams = {
  userPhoneNumber: string;
};

const SUPER_SECRET = process.env.AGENT_SECRET || "";

export const getCurrentUser = async (params: GetCurrentUserParams) => {
  let phoneNumber = params.userPhoneNumber;
  if (!phoneNumber.startsWith("+")) {
    phoneNumber = "+" + phoneNumber;
  }

  const user = await convexClient.query(
    api.agent.queries.getUserByPhoneNumber,
    {
      phoneNumber: phoneNumber,
      secret: SUPER_SECRET,
    }
  );

  return user;
};


