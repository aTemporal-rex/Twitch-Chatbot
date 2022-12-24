#!/usr/bin/env python

from tkinter import *
from PIL import ImageTk,Image

root = Tk()
root.title("Bunni Senpai Bot")
root.iconbitmap("BunniSenpaiBot.ico")

my_img = ImageTk.PhotoImage(Image.open("BunniSenpaiBot_Title_small.png"))
my_label = Label(image=my_img)
my_label.pack()

e = Entry(root, width=50, borderwidth=5)
e.pack()
e.insert(0, "Things and stuff: ")
# e.get()

# Creating a label widget
myLabel1 = Label(root, text="Hello World!")
myLabel2 = Label(root, text="My name is John Eldenlord!")

# Shoving it onto the screen
# myLabel1.grid(row=0, column=0)
# myLabel2.grid(row=1, column=0)

def myClick():
    myLabel = Label(root, text=e.get())
    myLabel.pack()

myButton = Button(root, text="Enter things and stuff", command=myClick, bg="blue")
myButton.pack()

root.mainloop()