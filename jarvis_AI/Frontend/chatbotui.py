from PyQt5.QtWidgets import QApplication, QMainWindow, QLabel, QVBoxLayout, QPushButton, QTextEdit, QWidget
from PyQt5.QtGui import QMovie, QIcon
from PyQt5.QtCore import Qt, QSize
import sys

class JarvisUI(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Jarvis AI Assistant")
        self.setGeometry(100, 100, 500, 700)
        self.setStyleSheet("background-color: #121212; color: white;")

        # Main Widget
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)

        # Layout
        self.layout = QVBoxLayout()
        self.central_widget.setLayout(self.layout)

        # GIF Animation
        self.gif_label = QLabel()
        self.gif_label.setAlignment(Qt.AlignCenter)
        self.movie = QMovie("Frontend\Graphics\Jarvis.gif")  # Replace with your GIF path
        self.movie.setScaledSize(QSize(1000, 500))  # Resize the GIF using QSize
        self.gif_label.setMovie(self.movie)
        self.movie.start()
        self.layout.addWidget(self.gif_label)

        # Chat Window
        self.chat_window = QTextEdit()
        self.chat_window.setReadOnly(True)
        self.chat_window.setStyleSheet("background-color: #1E1E1E; border: 1px solid #333; padding: 10px;")
        self.layout.addWidget(self.chat_window)

        # Input Field
        self.input_field = QTextEdit()
        self.input_field.setFixedHeight(50)
        self.input_field.setStyleSheet("background-color: #1E1E1E; border: 1px solid #333; padding: 10px;")
        self.layout.addWidget(self.input_field)

        # Send Button for Chat
        self.send_button = QPushButton("Send")
        self.send_button.setStyleSheet("background-color: #444; color: white;")
        self.send_button.clicked.connect(self.send_message)
        self.layout.addWidget(self.send_button)

        # Mic Button
        self.mic_button = QPushButton()
        self.mic_button.setIcon(QIcon("Frontend\Graphics\Mic_on.png"))  # Replace with your Mic icon path
        self.mic_button.setIconSize(QSize(48, 48))
        self.mic_button.setFixedSize(60, 60)
        self.mic_button.setStyleSheet("border-radius: 30px; background-color: #444;")
        self.mic_button.clicked.connect(self.toggle_mic)
        self.layout.addWidget(self.mic_button, alignment=Qt.AlignCenter)

        self.mic_status = False

    def toggle_mic(self):
        if self.mic_status:
            # Mic is currently on, so mute it
            self.mic_button.setIcon(QIcon("Frontend/Graphics/Mic_off.png"))  # Mic mute icon
            self.chat_window.append("Mic muted")
        else:
            # Mic is currently muted, so unmute it
            self.mic_button.setIcon(QIcon("Frontend/Graphics/Mic_on.png"))  # Mic unmute icon
            self.chat_window.append("Mic unmuted")
        self.mic_status = not self.mic_status

    def send_message(self):
        user_input = self.input_field.toPlainText()
        if user_input:
            self.chat_window.append(f"User: {user_input}")
            self.input_field.clear()
            # Here, you will integrate the chatbot response after input processing
            self.chat_window.append(f"Jarvis: {self.get_bot_response(user_input)}")
    
    def get_bot_response(self, user_input):
        # Placeholder for chatbot integration
        # Replace with your chatbot logic or API call
        return "This is a placeholder response."


if __name__ == "__main__":
    app = QApplication(sys.argv)
    jarvis = JarvisUI()
    jarvis.show()
    sys.exit(app.exec_())
