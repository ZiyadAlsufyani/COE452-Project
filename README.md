# COE452-Project

# CAPSTONE PROJECT TEAM MATCHING WEB APP

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#Features)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Project Structure](#project-structure)
6. [Contribution](#contribution)

## Introduction
 A web-based tool designed to assist KFUPM students in creating
 capstone groups for their senior projects. The website will
 display teams that are looking for members to join. Additionally,
 the website will show suggested combinations based on the team
 members' university majors and the compatible fields for them.
 After reviewing the specifics of the teams they liked, the user will
 be able to submit a request to join them.

## Features
### Student Features
- Create and manage team profiles
- Submit requests to join existing teams 
- View team proposals based on major compatibility
- Communicate with team members via WhatsApp integration
- Edit personal profile information

### Admin Features 
- View and manage all teams

## Tech Stack
### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5.3 for responsive design
- Font Awesome for icons
- Google Fonts

### Backend 
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing

## Getting Started
### Prerequisites
- Node.js (v14+)
- MongoDB database
- npm package manager

### Installation

1. Clone the repository
```bash
git clone 
```

2. Install server dependencies
```bash
cd server
npm install
```

3. Configure environment variables Create a .env file in the server directory with:
MONGODB_URI=mongodb+srv://ziyad:Fvz49UPtx9lVET4q@testcluster.cpids.mongodb.net/team-formation-database
JWT_SECRET=write_any_jwt_secret_you_choose

4. Start the server
```bash
npm run dev
```

### Usage
1. Access the application at http://ec2-54-90-250-174.compute-1.amazonaws.com:80
    1) To view student pages enter (Email = ali@example.com, password = Aa11223344)
    2) To view admin page enter (Email = admin, password = Admin@1234)


## Project Structure
server/
├── models/         # Database models
├── public/         # Frontend assets
├── routes/         # API routes
└── server.js       # Main application file

## Contribution
    1) ALI ASIRI worked on (student-homepage.html) handling all related frontend and backend tasks including related database designing, as well as the necessary integration between different members' works for the project.
    2) ZIYAD ALSUFYANI worked on (admin-view-teams.html, student-team-proposals.html) handling all related frontend and backend tasks including related database designing, as well as Token authentication using JWT.
