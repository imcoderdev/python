import tkinter
from random import choice,randint,shuffle
from tkinter import *
from tkinter import messagebox
import pyperclip
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


def save_everything():
    website = website_text.get()
    user_pass = username_text.get()
    password = pass_text.get()

    if len(website) == 0 or len(password) == 0:
        messagebox.showerror(title="Oops", message="fields cannot be empty")
    else:

        is_ok = messagebox.askokcancel(title=website,message=f"These are the details entered:\n email:{user_pass}"
                                                f"\nPassword:{password}\n is it okay to save?")


        if is_ok:
            with open("pass.txt", mode="a") as file:
                file.write(f"{website} | {user_pass} | {password}\n")
                pass_text.delete(0, END)
                website_text.delete(0, END)







def save_and_delete():
    save_everything()






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

#entries and names
pass_website=Label(text="website:")
pass_website.grid(column=0,row=1)
website_text = Entry(width=35)
website_text.grid(column=1,row=1,columnspan=2)
website_text.focus()


username=Label(text="username/email:")
username.grid(column=0,row=2)
username_text = Entry(width=35)
username_text.grid(column=1,row=2,columnspan=2)
username_text.insert(0,"kalenamdev168@gmail.com")

pass_website=Label(text="password:")
pass_website.grid(column=0,row=3)
pass_text = Entry(width=20)
pass_text.grid(column=1,row=3)
pass_text.delete(0,END)

























window.mainloop()