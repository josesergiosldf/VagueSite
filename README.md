# VAGUE ✨

### *Visually Advanced Unified Gaming Environment*

A stunningly modern web application for managing Minecraft modpack suggestions with your friends. Built with Python Flask, featuring a sleek Trello-style interface and intelligent detection of CurseForge and Modrinth mods.

---

## Features 🚀

- **🎨 Ultra-Modern UI**: Glassmorphism design with smooth animations and gradient accents
- **📋 Trello-Style Board**: Beautiful kanban board with Pending, Approved, and Rejected columns
- **🔗 Smart URL Detection**: Automatically identifies CurseForge, Modrinth, or other mod sources
- **👨‍💼 Admin Controls**: Approve or reject suggestions with detailed rejection reasons
- **👥 Team Collaboration**: Secure user registration and authentication system
- **📊 Live Statistics**: Real-time dashboard showing mod status metrics
- **🎯 Smart Filtering**: Quick-access filters to view mods by status
- **💫 Smooth Animations**: Buttery-smooth transitions and hover effects
- **📱 Fully Responsive**: Perfect experience on desktop, tablet, and mobile

## Design Showcase 🎨

The application features:
- **Dark gradient background** with floating orb effects
- **Glassmorphism cards** with backdrop blur and subtle borders
- **VAGUE branding** with gradient logo and modern typography (Inter font)
- **Color-coded sources**: CurseForge (orange), Modrinth (green), Other (yellow)
- **Glowing buttons** with smooth hover animations
- **Sleek statistics cards** with gradient backgrounds
- **Modern modals** with slide-up animations
- **Custom scrollbars** matching the color scheme

## Technology Stack 💻

### Backend
- **Flask** - Lightweight Python web framework
- **SQLite** - Database with Flask-SQLAlchemy ORM
- **Flask-Login** - User session management
- **Werkzeug** - Password hashing and security

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients, glassmorphism, animations
- **JavaScript (Vanilla)** - Dynamic interactions, no framework bloat
- **Inter Font** - Clean, modern typography from Google Fonts
- **Font Awesome 6** - Beautiful icon library

### Design Features
- Glassmorphism and backdrop filters
- CSS Grid and Flexbox layouts
- Gradient text and backgrounds
- Smooth cubic-bezier transitions
- Custom scrollbar styling
- Responsive breakpoints

1. **Navigate to the project directory**:
   ```powershell
   cd c:\Users\Joseph\Documents\vague
   ```

2. **Install required dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```powershell
   python app.py
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:5000
   ```

## Default Admin Account 🔑

On first run, an admin account is automatically created:
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the admin password after first login!

## Usage Guide 📖

### For Regular Users:

1. **Register an Account**:
   - Click "Register here" on the login page
   - Create your username and password

2. **Submit Mod Suggestions**:
   - Click the "Suggest Mod" button
   - Enter the mod name and URL (from CurseForge or Modrinth)
   - Add an optional description
   - The system will automatically detect the mod source

3. **Track Your Suggestions**:
   - View all suggestions on the Trello-style board
   - See pending, approved, and rejected mods
   - Check rejection reasons if your mod wasn't approved

### For Admins:

1. **Review Suggestions**:
   - All pending mods appear in the "Pending" column
   - Click "Approve" to accept a mod
   - Click "Reject" to decline with a reason

2. **Manage Mods**:
   - Approved mods move to the "Approved" column
   - Rejected mods show the rejection reason
   - Delete any mod suggestion if needed

## Project Structure 📁

```
vague/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── templates/            # HTML templates
│   ├── base.html         # Base template
│   ├── index.html        # Main dashboard
│   ├── login.html        # Login page
│   └── register.html     # Registration page
├── static/              # Static files
│   ├── css/
│   │   └── style.css    # Styles
│   └── js/
│       └── main.js      # JavaScript functionality
└── modpack.db           # SQLite database (created on first run)
```

## Configuration ⚙️

### Security: Change Secret Key

For production, update the secret key in `app.py`:

```python
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
```

Generate a secure random key:
```python
import secrets
print(secrets.token_hex(32))
```

### Database

SQLite database (`modpack.db`) is created automatically on first run. To reset:
```powershell
Remove-Item modpack.db
python app.py
```

## Technology Stack 💻

- **Backend**: Flask (Python)
- **Database**: SQLite with Flask-SQLAlchemy
- **Authentication**: Flask-Login
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Icons**: Font Awesome 6
- **Styling**: Custom CSS with gradient design

## Features Explained 🎯

### URL Detection

The system automatically detects mod sources:
- **CurseForge**: URLs containing "curseforge.com"
- **Modrinth**: URLs containing "modrinth.com"
- **Other**: Any other URL

### Security

- Passwords are hashed using Werkzeug's security functions
- Login required for all main features
- Admin-only routes protected with decorators
- CSRF protection via Flask's secret key

### User Experience

**Modern Design Principles:**
- Glassmorphism for depth and elegance
- Consistent 12-16px border radius for modern feel
- Gradient accents for visual interest
- Smooth animations (cubic-bezier easing)
- Proper spacing and typography hierarchy

**Accessibility:**
- High contrast text on backgrounds
- Clear visual feedback on interactions
- Keyboard-friendly navigation
- Responsive touch targets (min 44x44px)

## API Endpoints 🔌

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Dashboard | Yes |
| POST | `/login` | User login | No |
| POST | `/register` | User registration | No |
| GET | `/logout` | User logout | Yes |
| POST | `/suggest` | Submit mod suggestion | Yes |
| GET | `/api/suggestions` | Get all suggestions (JSON) | Yes |
| POST | `/admin/approve/<id>` | Approve mod | Admin only |
| POST | `/admin/reject/<id>` | Reject mod with reason | Admin only |
| DELETE | `/admin/delete/<id>` | Delete mod suggestion | Admin only |

## Troubleshooting 🔧

### Port Already in Use

If port 5000 is already in use, modify `app.py`:
```python
app.run(debug=True, port=5001)  # Change to any available port
```

### Database Issues

To reset the database, delete `modpack.db` and restart the application.

### Module Not Found

Ensure all dependencies are installed:
```powershell
pip install -r requirements.txt
```

## Future Enhancements 🚀

Potential features to add:
- 🔔 Email/Discord notifications for approvals/rejections
- 🏷️ Mod categories, tags, and dependencies
- 🔍 Advanced search with filters
- 📎 File attachments for mod configurations
- 🔗 Direct integration with CurseForge/Modrinth APIs
- 📦 Export modpack list to various formats (JSON, CSV)
- 📊 Version tracking and changelog
- 💬 Comments and discussions on suggestions
- 🌙 Dark/light mode toggle
- 📈 Analytics dashboard for admins
- ⭐ Voting system for suggestions
- 🔄 Bulk operations for admins

## Contributing 🤝

Contributions are welcome! Feel free to:
- Fork the repository
- Create a feature branch
- Submit a pull request
- Report bugs or suggest features

## Support 💬

If you encounter any issues or have questions:
1. Check the Troubleshooting section
2. Review the README documentation
3. Create an issue with detailed information

## License 📄

This project is free to use for personal and educational purposes.

---

<div align="center">

**Built with ❤️ for the Minecraft modding community**

*VAGUE - Where mod management meets modern design*

</div>
