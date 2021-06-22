# Twitch-Chatbot
A bot for twitch chat that has many useless features, and some kinda cool ones too I guess

## Contents

[Queue](#queue)  
[Commands](#commands)

## Queue
All commands start with a **b** to avoid unintended interaction with other bots  

### Admin Commands
* **!bstart** - Starts the queue ( **!bopen** also works )  
* **!bclose** - Closes the queue  

* **!bend** - Terminates the queue ( finished using queue )  

* **!bclear** - Clears the queue ( currently playing remains )  

* **!bnext [number]** - Selects the next **[number]** users from queue ( default **[number]** value is 1 )

### Everyone Commands
* **!bqueue** - Shows users in queue  

* **!bcurrent** - Shows users currently playing  

* **!bjoin** - Joins the queue

**Instructions:**

1. Start the queue by typing **!bstart** or **!bopen**
2. Join the queue by typing **!bjoin**
3. To see current users in queue type **!bqueue**
4. Select a certain number of viewers from queue by typing **!bnext**, **!bnext[number]**, or **!bnext [number]** ( **!bnext** just selects 1 )
5. Display currently selected users by typing **!bcurrent**
6. Close the queue to disallow further joins by typing **!bclose**
7. Terminate the queue to disable all queue functionality by typing **!bend**

**Examples:**

**!bnext** will select the next 1 viewer from the queue.

**!bnext3** or **!bnext 3** will select the next 3 viewers from the queue. These viewers can be displayed by using **!bcurrent**

## Commands

### Admin Commands
* **!baddcommand ![command name] [command response]** - Adds a new command named **[command name]** that will display **[command response]** in the chat (**[command name]** has to be alphanumeric)  

* **!bdelcommand ![command name]** - Deletes the command **![command name]**  

* **!baddalias ![command name] ![alias name]** - Adds an alias to the selected 
command  

* **!bdelalias ![command name] ![alias name]** - Deletes an alias from the selected command

### Everyone Commands
* **!anime** - Selects a random anime  

* **!manga** - Selects a random manga 

* **!anime[number]** - Selects a random anime with an average rating greater than [number]  

* **!manga[number]** - Selects a random manga with an average rating greater than [number]  

* **!joke** - Tells a joke  

* **!dadjoke** - Tells a d(b)ad joke ( dang that was a good one :sunglasses: )  

* **![command name]** - Displays response of **[command name]** if it exists