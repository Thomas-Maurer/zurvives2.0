# Zurvives2.0

Is an adaptation of [D&D](http://dnd.wizards.com/) / [Zombicide](https://zombicide.com/) board game online.

This application is under development.

This uses:

* [Sails/Node](http://sailsjs.org) application
* [Npm](https://www.npmjs.com/)
* [Bower](https://bower.io/)
* [createJS](http://www.createjs.com/)

## Informations

You need to have a MYSQL server up and running with `root:root` and a database named `Zurvives`. 

You can find [here](https://trello.com/b/saO73dvA/zurvives-2-0) the current state of the development.

## Get started

You need to clone the repo, then go to the project folder then run :
`
npm update
`

After go to repo/assets :
`
bower update
`
Before you lift the application you need to set up the database, to do that you will modify the file : `connection.js` in `repo/config`

To run the application just do:
`
sails lift
`

Finally go [here](http://localhost:1337)
