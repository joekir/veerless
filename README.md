# Veerless

![Bounty](/public/images/Bounty.jpg "'Bounty', painting of a replica of the Bounty entering the harbour of Ostend, Belgium; by Yasmina (1949- ), a Belgian painter specialized in marines and depictions of tall ships - Creative Commons Attribution 3.0")

##### A proof of concept for bi-directional two factor authentication.
*The intent of this design is to mitigate the real time phishing of two-factor authentication tokens, but more generally provide assurance that you are talking to the server you spoke to on registration.*

It's called **Veerless**, as it doesn't let you veer off course from the genuine server.

### How to try it out

1. Download the code from [https://github.com/joekir/veerless](https://github.com/joekir/veerless) follow the setup steps below.
2. Review the code in the chrome-extension, and if you're ok with its intent then install that.
3. Navigate to [https://veerless.herokuapp.com/register](https://veerless.herokuapp.com/register). The available users to choose from are:             
`{username:"user1", password:"foobar"}`       
`{username:"user2", password:"password1"}`            
This endpoint will give you the `t0` and `server_secret` to add to your chrome extension, via its background page in the settings.
4. Now you can login at [https://veerless.herokuapp.com/login](https://veerless.herokuapp.com/login) with the user that you chose. To generate the client-code, you need to input the given server-code in your chrome extension, the result will either :
  - Provide you with the client code.
  - Tell you that the server-code failed and not let you proceed any further.
In this case as you've just set it up it **should** grant you a client-code.
5. Create a line in /etc/hosts like this       
  `0.0.0.0         veerless.herokuapp.com  veerless`          
   this is so you can setup a spoof site, to compare to the live site, just note you'll now need to browse to [http://veerless.herokuapp.com:3000](http://veerless.herokuapp.com:3000) because:    
   1. There's no TLS setup in the local express app.
   2. To use low ports (like 80) you need to run as `sudo` and I don't want you to do that.
6. Now try authenticate in the same way as step 4. Notice the extension should now detect that this is a spoofed site.


### Site Layout

* [/](https://veerless.herokuapp.com) - this README page.
* [/login](https://veerless.herokuapp.com/login) - used to complete the login flow with veerless chrome-extension assisting.
* [/register](https://veerless.herokuapp.com/register) - retrieves the initial time seed (`t0`) for TOTP and the server secret for a given user.

### Design details
- [https://www.josephkirwin.com/2016/08/05/serverside-otp-part2/](https://www.josephkirwin.com/2016/08/05/serverside-otp-part2/)       
- [https://www.josephkirwin.com/2016/08/02/serverside-otp-part1/](https://www.josephkirwin.com/2016/08/02/serverside-otp-part1/)

### Setup

`npm update`    
`npm start`    

*The database is self provisioning.*
