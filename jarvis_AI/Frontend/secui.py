import sys
from PyQt5.QtWidgets import QApplication, QMainWindow, QPushButton, QLabel, QTextEdit
from PyQt5.QtGui import QMovie, QIcon
from PyQt5.QtCore import Qt, QRect, QPropertyAnimation  # QPropertyAnimation को PyQt5.QtCore से आयात करें

class JarvisUI(QMainWindow):
    def __init__(self):
        super().__init__()
        
        # Main Window Settings
        self.setWindowTitle("Jarvis AI")
        self.setGeometry(100, 100, 800, 600)  # (x, y, width, height)
        self.setStyleSheet("background-color: black;")  # Black background
        
        # Adding GIF Background
        self.gif_label = QLabel(self)
        self.gif_label.setGeometry(0, 0, 800, 600)  # Full window size
        self.gif_label.setAlignment(Qt.AlignCenter)
        self.movie = QMovie("Frontend/Graphics/Jarvis.gif")  # Replace with your GIF file path
        self.gif_label.setMovie(self.movie)
        self.movie.start()
        
        # Adding Mic Button (with PNG)
        self.mic_button = QPushButton(self)
        self.mic_button.setGeometry(350, 450, 100, 100)  # Center position for Mic button
        self.mic_button.setIcon(QIcon("Frontend/Graphics/Mic_on.png"))  # Replace with your PNG file path
        self.mic_button.setIconSize(self.mic_button.size())
        self.mic_button.setStyleSheet("border: none;")  # Remove border
        self.mic_button.clicked.connect(self.mic_action)
        
        # Mic State
        self.mic_muted = False

        # Adding "Home" Button
        self.home_button = QPushButton("Home", self)
        self.home_button.setGeometry(20, 20, 80, 40)
        self.home_button.setStyleSheet("""
            QPushButton {
                background-color: white;
                color: black;
                font-size: 14px;
                border-radius: 10px;
                padding: 5px;
            }
            QPushButton:hover {
                background-color: gray;
                color: white;
            }
        """)
        self.home_button.clicked.connect(self.home_action)
        
        # Adding "Chat" Button
        self.chat_button = QPushButton("Chat", self)
        self.chat_button.setGeometry(120, 20, 80, 40)
        self.chat_button.setStyleSheet("""
            QPushButton {
                background-color: white;
                color: black;
                font-size: 14px;
                border-radius: 10px;
                padding: 5px;
            }
            QPushButton:hover {
                background-color: gray;
                color: white;
            }
        """)
        self.chat_button.clicked.connect(self.chat_action)
        
        # Adding "Exit" Button
        self.exit_button = QPushButton("Exit", self)
        self.exit_button.setGeometry(680, 20, 80, 40)
        self.exit_button.setStyleSheet("""
            QPushButton {
                background-color: red;
                color: white;
                font-size: 14px;
                border-radius: 10px;
                padding: 5px;
            }
            QPushButton:hover {
                background-color: darkred;
            }
        """)
        self.exit_button.clicked.connect(self.close)

        # Chat Box (Hidden by default)
        self.chat_box = QTextEdit(self)
        self.chat_box.setGeometry(800, 100, 300, 400)  # Positioned outside the window initially
        self.chat_box.setStyleSheet("background-color: white; border: 2px solid gray; font-size: 14px;")
        self.chat_box.setVisible(False)

    # Button Actions
    def mic_action(self):
        if self.mic_muted:
            self.mic_button.setIcon(QIcon("Frontend/Graphics/Mic_on.png"))  # Unmute icon
            print("Mic Unmuted!")
        else:
            self.mic_button.setIcon(QIcon("Frontend/Graphics/Mic_off.png"))  # Mute icon
            print("Mic Muted!")
        self.mic_muted = not self.mic_muted  # Toggle state

    def home_action(self):
        print("Home Button Clicked!")
        if self.chat_box.isVisible():
            self.animate_chat_box(close=True)

    def chat_action(self):
        print("Chat Button Clicked!")
        if not self.chat_box.isVisible():
            self.animate_chat_box(close=False)

    def animate_chat_box(self, close):
        if close:
            self.animation = QPropertyAnimation(self.chat_box, b"geometry")
            self.animation.setDuration(500)  # Animation duration in ms
            self.animation.setStartValue(self.chat_box.geometry())
            self.animation.setEndValue(QRect(800, 100, 300, 400))  # Move out of window
            self.animation.start()
            self.animation.finished.connect(lambda: self.chat_box.setVisible(False))
        else:
            self.chat_box.setVisible(True)
            self.animation = QPropertyAnimation(self.chat_box, b"geometry")
            self.animation.setDuration(500)  # Animation duration in ms
            self.animation.setStartValue(QRect(800, 100, 300, 400))  # Positioned outside the window
            self.animation.setEndValue(QRect(500, 100, 300, 400))  # Slide into the window
            self.animation.start()

# Main Application
if __name__ == "__main__":
    app = QApplication(sys.argv)
    jarvis_ui = JarvisUI()
    jarvis_ui.show()
    sys.exit(app.exec_())
