# Veerless

![Bounty](/public/images/Bounty.jpg "'Bounty', painting of a replica of the Bounty entering the harbour of Ostend, Belgium; by Yasmina (1949- ), a Belgian painter specialized in marines and depictions of tall ships - Creative Commons Attribution 3.0")

##### A proof of concept for bi-directional two factor authentication.
*The intent of this design is to mitigate the real time phishing of two-factor authentication tokens, but more generally provide assurance that you are talking to the server you spoke to on registration.*

### How to try it out

1. Download the code from the repo, follow the setup steps below.
2. If you're ok with the code in the chrome-extension then install that.
3. Navigate to ###TODO### and go to the [/register](/register). The available users to choose from are:             
`{username:"user1", password:"foobar"}`       
`{username:"user2", password:"password1"}`            
This endpoint will give you the `t0` and `server_secret` to add to your chrome extension, via its background page in the settings.
4. Now you can login at ###TODO### with the user that you choes. To generate the client secret, you need to input the code from your extension, and it will either :
  - Provide you with the client code.
  - Tell you that the server code failed and not let you proceed.
5. Create a line in /etc/hosts like this       
  `0.0.0.0 TODO`          
   *this is so you can setup a spoof site, to compare to the live site*


### Site Layout

* [/](/) - this README page.
* [/login](/login) - used to complete the login flow with veerless chrome-extension assisting.
* [/register](/register) - retrieves the initial time seed (`t0`) for TOTP and the server secret for a given user.

### Design details
- [https://www.josephkirwin.com/2016/08/05/serverside-otp-part2/](https://www.josephkirwin.com/2016/08/05/serverside-otp-part2/)       
- [https://www.josephkirwin.com/2016/08/02/serverside-otp-part1/](https://www.josephkirwin.com/2016/08/02/serverside-otp-part1/)

### Setup

`npm update`    
`npm start`    

*The database is self provisioning.*
