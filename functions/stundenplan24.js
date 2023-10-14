export async function onRequest(context) {
    // constants
    const login = context.env.LOGIN
    const password = context.env.PASSWORD
    const schulnummer = context.env.SCHULNUMMER
    const baseUrl = "https://www.stundenplan24.de/" + schulnummer + "/mobil/mobdaten/"

    const url = new URL(context.request.url)
    const date = url.searchParams.get("date")

    let urlVpMobil = baseUrl + "Klassen.xml"
  
    // get plan for a specificied date
    if (date){
      urlVpMobil = baseUrl + "PlanKl" + date + ".xml"
    }

    // Forward / Proxy original request
    const responseVp = await fetch(urlVpMobil, {
      method: "GET",
      headers: {"Authorization": "Basic " + btoa(login + ":" + password)}
    });

    // Add custom header(s)
    const response = new Response(responseVp.body, responseVp);
    response.headers.append("Access-Control-Allow-Origin", "*")

    return response;
  }
  