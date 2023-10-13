export default {
  async fetch(request, env, context) {
    // constant values
    const login = env.LOGIN
    const password = env.PASSWORD
    const schulnummer = env.SCHULNUMMER
    const baseUrl = "https://www.stundenplan24.de/" + schulnummer + "/mobil/mobdaten/"

    const url = new URL(request.url)
    
    const date = url.searchParams.get("date")

    let urlVpMobil = baseUrl + "Klassen.xml"
  
    // get plan for a specificied date
    if (date){
      urlVpMobil = baseUrl + "PlanKl" + date + ".xml"
    }

    // Forward / Proxy original request
    let res = await fetch(urlVpMobil, {
      method: "GET",
      headers: {"Authorization": "Basic " + btoa(login + ":" + password)}
    });

    // Add custom header(s)
    res = new Response(res.body, res);
    res.headers.append("Access-Control-Allow-Origin", "*")

    // Done
    return res;
  },
};
