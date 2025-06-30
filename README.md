# Skillvento 🚀  
**Your Career, Organized.**

Skillvento is an **AI-powered career platform** that helps students and professionals accelerate their growth. With a secure **Certificate Vault**, an intuitive **AI Resume Builder**, **team collaboration features**, and a **shareable portfolio**, Skillvento empowers users to showcase their skills, track their progress, and stand out to employers — all in one place.

> This project was built with ❤️ using [**Bolt**](https://bolt.new).

# Link - [**Skillvento**]([https://bolt.new](https://skillvento.mitraadi.com/))

---

## ✨ Key Features

- 🗄️ **Certificate Vault**  
  Securely store and organize all your certificates, diplomas, and achievements in one beautiful dashboard.

- 🤖 **AI Resume Builder**  
  Instantly generate polished resumes from your profile and uploaded certificates — with multiple template options.

- 📊 **Skill Analytics**  
  Visualize your learning journey with interactive charts showing your progress and trends over time.

- 🤝 **Team Collaboration**  
  Collaborate on group portfolios for hackathons or projects. Share achievements and work collectively.

- 🌐 **Shareable Portfolios**  
  Create a stunning public profile with a custom URL to showcase your skills to recruiters or clients.

- 🎁 **Referral System**  
  Invite friends and earn upload credits. Both you and your referrals enjoy bonus storage.

---

## 🛠️ Tech Stack

| Layer       | Technologies |
|-------------|--------------|
| **Frontend** | React, TypeScript, Tailwind CSS, Vite |
| **Backend**  | Supabase (PostgreSQL, Auth, Storage) |
| **Deployment** | Bolt |

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### ✅ Prerequisites

- **Node.js** (v14 or higher)  
- **npm** or **yarn**

### 📦 Installation

1. **Clone the repo**
    ```bash
    git clone https://github.com/your_username/skillvento.git
    cd skillvento
    ```

2. **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Set up Supabase**

    - Go to [Supabase](https://supabase.com/) and create a new project.
    - In the project dashboard, navigate to **SQL Editor** and run the SQL scripts from `supabase/migrations/` to set up your database.
    - Go to **Settings > API** to get your Project URL and anon public key.

4. **Create a `.env` file**
    ```env
    VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

5. **Run the development server**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

6. Visit `http://localhost:5173` in your browser 🎉

---

## 🧪 Usage

- Sign up or log in.
- Upload certificates via the Dashboard.
- Use the AI Resume Builder to generate and download your resume.
- Join or create a Team to collaborate with others.
- View and share your public portfolio at `/u/your_username`.

---

## 🤝 Contributing

We love contributions! ❤️

1. **Fork the repo**
2. **Create your branch**  
   ```bash
   git checkout -b feature/AmazingFeature
Commit your changes

bash
Copy
Edit
git commit -m "Add AmazingFeature"
Push to the branch

bash
Copy
Edit
git push origin feature/AmazingFeature
Open a Pull Request

Please open issues for any suggestions, bugs, or enhancements.
