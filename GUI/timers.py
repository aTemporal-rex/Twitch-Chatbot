from tkinter import *
from tkinter import messagebox
from PIL import ImageTk,Image
from db import get_database
import re
from themes import light_theme,dark_theme
from utilities import ButtonLabel,create_checkbox,handle_checkbox
from pymongo.collection import ReturnDocument
import os

dbname = get_database()
timers_collection = dbname["timers"]
timers_collection.create_index('name', unique = True)
