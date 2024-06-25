import { Price } from "@/types/types";
import { url } from "inspector";

export const getURL = () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    "http://localhost:3000/";

  // Ensure URL starts with 'https://' if it doesn't start with 'http'
  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }

  // Ensure URL ends with '/'
  if (!url.endsWith("/")) {
    url = `${url}/`;
  }

  return url;
};

export const postData = async ({
  url,
  data,
}: {
  url: string;
  data?: { price: Price };
}) => {
  console.log("POST Request", url, data);

  const response: Response = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    console.log("Error in Post", { url, data, response });
    throw new Error(response.statusText);
  }
  return response.json();
};

export const toDateTime = (secs: number) => {
  var t = new Date("1970-01-01T00:30:00Z");
  t.setSeconds(secs);
  return t;
};
