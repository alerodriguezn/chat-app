import { startCronJobs } from "../../lib/cron-jobs";
import { NextResponse } from "next/server";

startCronJobs();

export default function handler() {
  return new NextResponse(JSON.stringify({ message: "Hello, World!" }));
}
