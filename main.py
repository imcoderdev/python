import tkinter
from random import choice,randint,shuffle
from re import search
from tkinter import *
from tkinter import messagebox
import pyperclip
import json
import pandas
# ---------------------------- PASSWORD GENERATOR ------------------------------- #
def password_create():

    letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
    symbols = ['!', '#', '$', '%', '&', '(', ')', '*', '+']





    password_letter = [choice(letters) for _ in range(randint(3, 5))]
    password_number = [choice(numbers) for _ in range(randint(2, 4))]
    password_symbol = [choice(symbols) for _ in range(randint(2, 4))]

    password_list = password_letter+password_number+password_symbol
    shuffle(password_list)

    password = "".join(password_list)
    # print(password)
    pass_text.insert(0,password)
    pyperclip.copy(password)



# ---------------------------- SAVE PASSWORD ------------------------------- #


def save_and_delete():
    website = website_text.get()
    user_pass = username_text.get()
    password = pass_text.get()

    new_data = {
        website:{"email":user_pass,
                 "password":password
        }
    }



    if len(website) == 0 or len(password) == 0:
        messagebox.showerror(title="Oops", message="fields cannot be empty")
    else:
        try:
            with open("pass.json", mode="r") as data_file:
                data = json.load(data_file)

        except:
            with open("pass.json","w") as data_file:
                json.dump(new_data,data_file,indent=4)
                # pass_text.delete(0, END)
                # website_text.delete(0, END)
        else:
            data.update(new_data)
            with open("pass.json","w") as data_file:
                json.dump(data,data_file,indent=4)
        finally:
                pass_text.delete(0, END)
                website_text.delete(0, END)

def search_from_json():
    try:
        with open("pass.json","r") as data_file:
            data = json.load(data_file)
        website = website_text.get()
    except FileNotFoundError as error_message:
        messagebox.showerror(title="no such file",message="create a file to continue")
    else:
        if website in data:
                email = data[website]["email"]
                password = data[website]["password"]
                messagebox.showinfo(title="Information",message=f"You info is\nemail:{email}\npassword:{password}")
        else:
            messagebox.showerror(title="error",message=f"No such data for \n{website} ")







# ---------------------------- UI SETUP ------------------------------- #
#window creation
window = Tk()
window.title("Password generator")
window.config(padx=50,pady=50)
#creating image
canvas = Canvas(width=200,height=200)
logo = PhotoImage(file="logo.png")
canvas.create_image(100,100,image=logo)
canvas.grid(column=1,row=0)
#buttons
gen_password = Button(text="Generate Password",command=password_create)
gen_password.grid(column=2,row=3)

add = Button(window,text="Add",width=36,command=save_and_delete)
add.grid(column=1,row=4,columnspan=2)

search_web = Button(text="search",width=10,command=search_from_json)
search_web.grid(column=2,row=1)
#entries and names
pass_website=Label(text="website:")
pass_website.grid(column=0,row=1)
website_text = Entry(width=17)
website_text.grid(column=1,row=1)
website_text.focus()


username=Label(text="username/email:")
username.grid(column=0,row=2)
username_text = Entry(width=35)
username_text.grid(column=1,row=2,columnspan=2)
username_text.insert(0,"kalenamdev168@gmail.com")

pass_website=Label(text="password:")
pass_website.grid(column=0,row=3)
pass_text = Entry(width=17)
pass_text.grid(column=1,row=3)
pass_text.delete(0,END)

























window.mainloop()