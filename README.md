# career-vault

Project to keep a track of your job application and their status.
To make this project working, I'll use firebase for three reasons:

- it has its own authentication system
- it provide a database
- I only want to build a front-end, and firebase provide a good back-end

# Set up firebase

To be able to use firebase here, you'll need to set up a few thing. First, you need to register on firebase and create a new project.

## Create authentication

- Go inside your project
- Go to "Create" section
- Select "Authentication"
- Click "Begin"
- In the opened wizard: Click "next", select starting mode and click "create"

## Create database

- Go inside your project
- Go to "Create" section
- Select "Firestore database"
- Click "Create database"
- in the "Connection methods" tab
  - Select "Email/Password"
  - Active "Email/Password" (do not activate the second option)

# Possible upgrade

- add translation to the application
- review login/register forms style
- add deconnection
- store user session state inside browser, so if session is valid then relog user in
- Possibility to add avatar for user
- possibility to update user profil information like: mail, password, ...
- add possibility to share the tracking to other via a link (with a code, only person with this link can acces your tracking)
- add filtering to the tracking

# Hosting application with firebase hosting

- go to your firebase project
- create an hosting
- follow the instruction that appears on the screen
