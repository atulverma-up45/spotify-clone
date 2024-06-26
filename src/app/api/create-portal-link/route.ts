import { getURL } from "@/libs/helpers";
import { stripe } from "@/libs/stripe";
import { createOrRetriveCustomer } from "@/libs/supabaseAdmin";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({
      cookies,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Could not get User");
    }
    const customer = await createOrRetriveCustomer({
      uuid: user.id || "",
      email: user.email || "",
    });

    if (!customer) {
      throw new Error("Could not get customer");
    }

    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getURL()}/account`,
    });

    return NextResponse.json({
      url,
    });
  } catch (error: any) {
    console.log("Error occured in create-portal-api :",error.message);

    return new NextResponse("Internal Error", { status: 500 });
  }
}
