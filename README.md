# Veerless

[![NSP Status](https://nodesecurity.io/orgs/joekir/projects/88a3add0-4b28-471d-b7a6-08877ae5bafd/badge)](https://nodesecurity.io/orgs/joekir/projects/88a3add0-4b28-471d-b7a6-08877ae5bafd)

![Bounty](/public/images/Bounty.jpg "'Bounty', painting of a replica of the Bounty entering the harbour of Ostend, Belgium; by Yasmina (1949- ), a Belgian painter specialized in marines and depictions of tall ships - Creative Commons Attribution 3.0")

##### A proof of concept for bi-directional two factor authentication.
*The intent of this design is to mitigate the real time phishing of two-factor authentication tokens, but more generally provide assurance that you are talking to the server you spoke to on registration.*

It's called **Veerless**, as it doesn't let you veer off course from the genuine server.

### How to try it out

1. Download the code from [https://github.com/joekir/veerless](https://github.com/joekir/veerless) follow the setup steps below.
2. Review the code in the chrome-extension, and if you agree its non-harmful then install that. ([help on how to do that](https://developer.chrome.com/extensions/getstarted#unpacked))
3. Navigate to [https://veerless.josephkirwin.com/register](https://veerless.josephkirwin.com/register). This endpoint will give you the `t0` and `server_secret` to add to your chrome extension, via the "options" page in the extension's settings.
4. Now you can login at [https://veerless.josephkirwin.com/login](https://veerless.josephkirwin.com/login) with the user that you chose. The extension will be looking for:
  - X-Veerless-Init header from the server to begin the login transaction
  - X-Veerless-Response header from the server containing its TOTP variant, that it will verify.    

  If it can successfully verify the header, you shouldn't see any difference to a common 2FA login experience, except that you client TOTP will be provided in a notification. If it cannot successfully verify the header, it will cancel the request, and notify you of this.

### More Fiddling
You could then try and setup your own local site, attempting to spoof the live demo ; )

- Using the code you downloaded in step 1. With the setup steps below
- Create a line in /etc/hosts like this (which kindof simulates a dns hijack for you)    
  `127.0.0.1      veerless.josephkirwin.com      veerless`          
- Now try authenticate in the same way as step 4. Notice the extension should now detect that this is a spoofed site.

### Site Layout

* [/](https://veerless.josephkirwin.com) - this README page.
* [/login](https://veerless.josephkirwin.com/login) - used to complete the login flow with veerless chrome-extension assisting.
* [/register](https://veerless.josephkirwin.com/register) - retrieves the initial time seed (`t0`) for TOTP and the server secret for a given user.

### Design details

- [https://www.josephkirwin.com/2016/10/25/veerless-design-changes/](https://www.josephkirwin.com/2016/10/25/veerless-design-changes/)
- [https://www.josephkirwin.com/2016/08/05/serverside-otp-part2/](https://www.josephkirwin.com/2016/08/05/serverside-otp-part2/)       
- [https://www.josephkirwin.com/2016/08/02/serverside-otp-part1/](https://www.josephkirwin.com/2016/08/02/serverside-otp-part1/)

###### Extra
*This is actually an alternate design to Veerless that doesn't require the client to provide confidentiality of the server secret, only integrity.*
- [https://www.josephkirwin.com/2016/09/12/server-authentication-with-lamports-scheme/](https://www.josephkirwin.com/2016/09/12/server-authentication-with-lamports-scheme/)      

### Setup

Update the config.js file's `hostname` variable to your host.

`npm update`    
`npm start`    

*The database is self provisioning.*
