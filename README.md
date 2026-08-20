# Task App

An offline-first task management application built with React Native.

The app allows users to create, edit, complete, and delete personal tasks even when there is no internet connection. Task data is stored locally in Realm and synced with Firebase when the device comes back online.

The main goal of the project is to keep the application responsive and usable regardless of network availability.

---

## Features

* Create, edit, complete, and delete tasks
* Works without an internet connection
* Realm is the local source of truth
* Automatic background sync with Firestore
* Email/password authentication
* Per-user local database
* Last-write-wins conflict resolution
* Local task reminders
* Firebase Cloud Messaging support
* Foreground and background notifications
* Light, Dark, and System theme support
* Development, Staging, and Production environments
* Sync retries for failed operations

---

## Architecture

The application follows a layered architecture to keep UI, business logic, data access, and external services separated.

```text
UI
(screens / components)
        │
        ▼
Hooks / Redux
        │
        ▼
Services / Repositories
        │
        ├──────────────► Realm
        │                 Local source of truth
        │
        └──────────────► Firebase
                          Remote sync
```

### Important rule

Screens should stay as simple as possible.

They are responsible for:

* Rendering UI
* Handling user input
* Triggering actions through hooks or services
* Navigation

Screens should **not**:

* Read or write Realm directly
* Call Firebase directly
* Contain sync logic
* Manage notification scheduling

Task CRUD always writes to Realm first. Syncing happens separately in the background.

This keeps the UI fast and ensures the application continues to work when the device is offline.

---

# Tech Stack

| Area                | Technology               |
| ------------------- | ------------------------ |
| Mobile framework    | React Native             |
| Language            | TypeScript               |
| Navigation          | React Navigation         |
| State management    | Redux Toolkit            |
| Local database      | Realm                    |
| Authentication      | Firebase Auth            |
| Cloud database      | Firestore                |
| Push notifications  | Firebase Cloud Messaging |
| Network detection   | NetInfo                  |
| Local notifications | Notifee                  |
| Local persistence   | AsyncStorage             |
| Environment config  | react-native-config      |

Redux is intentionally **not used as the task database**.

Task data lives in Realm. Redux is used for application-level state such as:

* Authentication
* Connectivity
* Theme
* Form and UI state

---

# Project Structure

```text
src/
├── app/
│   ├── store/
│   └── App.tsx
│
├── config/
│   └── firebase/
│
├── navigation/
│   ├── AuthNavigator.tsx
│   ├── AppNavigator.tsx
│   └── RootNavigator.tsx
│
├── features/
│   ├── auth/
│   ├── tasks/
│   ├── settings/
│   ├── theme/
│   └── connectivity/
│
├── database/
│   ├── schema/
│   ├── mapper/
│   └── repositories/
│
├── services/
│   ├── auth/
│   ├── sync/
│   ├── firestore/
│   ├── notifications/
│   └── fcm/
│
├── components/
│   └── shared/
│
├── theme/
│   ├── colors.ts
│   ├── spacing.ts
│   └── index.ts
│
└── types/
```

Firebase configuration files are organized separately by environment:

```text
config/
└── firebase/
    ├── development/
    ├── staging/
    └── production/
```

---

# Getting Started

## Prerequisites

Before running the project, make sure your environment is ready for React Native development.

You will need:

* Node.js
* npm
* Xcode for iOS development
* Android Studio for Android development
* CocoaPods
* A Firebase account

Follow the standard React Native environment setup for your operating system before continuing.

---

# Installation

Clone the repository and install the dependencies.

```sh
git clone https://github.com/aalokbarma/task-management-app.git
cd task-app

npm install
```

For iOS, install Ruby and CocoaPods dependencies:

```sh
cd ios

bundle install
bundle exec pod install

cd ..
```

---

# Environment Configuration

The project supports three environments:

* Development
* Staging
* Production

Real environment files are not committed to Git.

Create them from the example files. 



### Development

```sh
cp .env.development.example .env.development
```

### Staging

```sh
cp .env.staging.example .env.staging
```

### Production

```sh
cp .env.production.example .env.production
```

Each environment file contains:

```env
ENVIRONMENT=development
APP_NAME=TaskApp (Dev)
```

Update the values depending on the environment.

For example:

### `.env.staging`

```env
ENVIRONMENT=staging
APP_NAME=TaskApp (Staging)
```

### `.env.production`

```env
ENVIRONMENT=production
APP_NAME=TaskApp
```

---

# Running the App

## Development

Start Metro:

```sh
npm run start:dev
```

Run on Android:

```sh
npm run android:dev
```

Or iOS:

```sh
npm run ios:dev
```

---

## Staging

Start Metro:

```sh
npm run start:staging
```

Run on Android:

```sh
npm run android:staging
```

Or iOS:

```sh
npm run ios:staging
```

---

## Production

Start Metro:

```sh
npm run start:production
```

Run on Android:

```sh
npm run android:production
```

Or iOS:

```sh
npm run ios:production
```

---

# Firebase Configuration

A separate Firebase project should be used for each environment.

```text
Development Firebase Project
        │
        └── config/firebase/development

Staging Firebase Project
        │
        └── config/firebase/staging

Production Firebase Project
        │
        └── config/firebase/production
```

Register the following applications in each Firebase project.

### Android

```text
com.taskapp
```

### iOS

```text
org.reactjs.native.example.taskapp
```

Place the Firebase configuration files in the matching environment directory.

```text
config/firebase/
│
├── development/
│   ├── google-services.json
│   └── GoogleService-Info.plist
│
├── staging/
│   ├── google-services.json
│   └── GoogleService-Info.plist
│
└── production/
    ├── google-services.json
    └── GoogleService-Info.plist
```

These files are ignored by Git.

Example configuration files are included so the project can still compile without real Firebase credentials.

If a real configuration file is missing, the build falls back to the corresponding `*.example` file.

Firebase features such as authentication, Firestore, and push notifications will not work until valid Firebase configuration files are added.

You can also manually synchronize Firebase configuration files:

```sh
npm run firebase:sync
```

The Android Gradle setup and the iOS **Copy Firebase Config** build phase handle this automatically when running the environment scripts.

For better convinience I will add the respective google config files in the email which you can simply add in respective directories. It will simply connect my firebase apps to the project.

<!-- For Development -->
config/firebase/development/google-services.json
config/firebase/development/GoogleService-Info.plist

<!-- For Staging -->
config/firebase/staging/google-services.json
config/firebase/staging/GoogleService-Info.plist

<!-- For Production -->
config/firebase/production/google-services.json
config/firebase/production/GoogleService-Info.plist

---

# Firebase Setup

For each Firebase project:

### 1. Enable Authentication

Enable:

```text
Email/Password
```

under Firebase Authentication providers.

### 2. Create Firestore

Create a Firestore database and deploy the included security rules.

The application stores user data under:

```text
users/{uid}
```

Tasks are stored under:

```text
users/{uid}/tasks/{taskId}
```

Users should only be able to access their own data.

The Firestore rules should enforce access so a user can only read or write:

```text
users/{their-user-id}
```

and:

```text
users/{their-user-id}/tasks/{task-id}
```

### 3. Enable Cloud Messaging

Enable Firebase Cloud Messaging.

For iOS, upload a valid APNs key in the Firebase project. 

---

# Offline-First Data Flow

Realm is the source of truth for task data.

The UI always reads tasks from the local Realm database.

When a user creates, edits, completes, or deletes a task:

```text
User Action
    │
    ▼
Task Service
    │
    ▼
Realm Updated Immediately
    │
    ▼
Operation marked as pending
    │
    ▼
SyncService
    │
    ├── Offline
    │     └── Keep pending
    │
    └── Online
          └── Sync with Firestore
```

This means task CRUD does not depend on the network.

A user can continue working normally while offline.

---

# Realm Per User

Each signed-in user gets their own Realm database.

```text
Realm Files

user_123.realm
user_456.realm
user_789.realm
```

The Realm database:

* Opens after sign-in
* Closes on sign-out
* Remains stored on the device after sign-out

Keeping the file allows the user's local data to remain available when they sign in again.

---

# Sync Strategy

Synchronization is handled by `SyncService`.

Sync runs automatically when:

* The user signs in
* Internet connectivity is restored
* The application returns to the foreground

Only one sync operation can run at a time.

The sync flow is:

```text
1. Pull remote changes
        │
        ▼
2. Merge with local Realm data
        │
        ▼
3. Push local pending operations
        │
        ▼
4. Update sync status
```

---

## Conflict Resolution

The app uses a simple last-write-wins strategy.

Tasks are compared using:

```text
version
```

followed by:

```text
updatedAt
```

If versions are equal, the most recently updated task wins.

Local changes that have not yet been synced are not overwritten during a remote pull.

This approach is intentionally simple and works well for a personal task application where the same user is the primary editor.

---

## Sync States

Local task operations can have internal sync states:

```text
pending
synced
failed
```

The UI does not display pending operations.

If a push fails and cannot be completed, the application shows:

```text
Sync failed
```

Failed operations remain available for a later retry.

---

# Firestore Structure

Tasks use the same ID in both Realm and Firestore.

```text
users
└── {userId}
    ├── fcmToken
    │
    └── tasks
        ├── {taskId}
        ├── {taskId}
        └── {taskId}
```

Using the same task ID simplifies synchronization and conflict handling.

---

# Local Notifications

Local task reminders are handled using Notifee.

A reminder is scheduled when:

* The task is incomplete
* The task has a due date
* The due date is in the future

The reminder is cancelled when:

* The task is completed
* The task is deleted
* The due date is removed

Notification permission is requested only when required.

If the user denies notification permission, task creation and other CRUD operations continue to work normally.

Tapping a reminder opens the corresponding task.

---

# Push Notifications

Firebase Cloud Messaging is used for push notifications.

After a successful sign-in:

```text
Device
   │
   ▼
Get FCM Token
   │
   ▼
Save token to

users/{userId}
```

When the user signs out, the stored token is cleared.

The application supports optional push payload data:

```json
{
  "taskId": "task-id",
  "type": "task",
  "title": "Task updated",
  "body": "Your task has been updated"
}
```

Supported message types include:

```text
task
sync
```

### Foreground

Foreground notifications are shown as an in-app banner from the top of the screen.

### Background

Background notifications use the device's normal heads-up notification behavior.

---

# Task Status Feedback

When a task is marked as complete or incomplete, the application displays a short in-app confirmation banner.

This gives immediate feedback without interrupting the user.

---

# Theme

The application supports three theme modes:

```text
System
Light
Dark
```

The selected preference is stored locally on the device.

The app uses the system appearance when **System** is selected.

Theme configuration is managed through the settings and theme layers rather than individual screens.

---

# iOS Push Notifications

Push notifications on iOS require a physical device.

The iOS simulator does not receive Firebase Cloud Messaging notifications.

For production or App Store builds, make sure the APNs environment is set to production.

File:

```text
ios/taskapp/taskapp.entitlements
```

Required value:

```xml
<key>aps-environment</key>
<string>production</string>
```

As I don't have a personal paid Apple developer account. So, I couldn't integrate the APN. So, currently the notification will come only in android emulator. But if you have a paid developer account and you create firebase apps by yourself, you can follow the process and connect the APN, it will work properly. I have added the functionality.

---

# Android Push Notifications

For FCM testing on an Android emulator, use an emulator image that includes:

```text
Google Play
```

Plain Android system images without Google Play services may not receive Firebase Cloud Messaging notifications correctly.

---

# Security

Firestore access is restricted so users can only access their own data.

The application should never allow one user to read or modify another user's tasks.

The expected Firestore structure is:

```text
users/{uid}
users/{uid}/tasks/{taskId}
```

All security rules should validate that:

```text
request.auth.uid == uid
```

before allowing access.

---

# Testing

Automated tests are currently not included in this project.

The main focus of the project is:

* Offline-first architecture
* Local data consistency
* Realm and Firestore synchronization
* Authentication
* Notifications
* Environment configuration
* Clean separation of responsibilities

---

# Known Limitations

### One FCM token per user

Only one FCM token is stored for each user.

If the same user signs in on another device, the latest token replaces the previous one.

---


### iOS Simulator

The iOS Simulator does not receive FCM push notifications.

Use a physical iPhone or iPad for push notification testing.

---

### Android Notification Channels

Android notification channels retain the importance level they were originally created with.

Changing the importance in code may not affect an existing installation.

If notification channel behavior does not update during development, uninstall and reinstall the application.

---

# Architecture Decisions

## Why Realm instead of Redux for tasks?

Tasks are application data that need to survive:

* App restarts
* Network failures
* Offline usage
* Sync operations

Realm is better suited for this than an in-memory Redux store.

The UI reads directly from the local database, so it does not need to wait for an API response.

Redux is still used where it makes sense for application state such as authentication, connectivity, theme, and UI state.

---

## Why local-first?

Writing to Realm first means:

```text
Tap "Save"
     │
     ▼
Task appears immediately
     │
     ▼
Sync happens separately
```

The user does not have to wait for the network.

This also avoids having two different application states for online and offline modes.

The app always works with local data.

---

## Why Last-Write-Wins?

A full conflict-resolution system such as CRDT would add significant complexity.

For a personal task application, a simpler strategy based on:

```text
version → updatedAt
```

is enough.

It keeps the sync logic easier to understand and maintain.

---

## Why separate Firebase projects?

Development, staging, and production environments should not share the same Firebase project.

This prevents:

* Development users appearing in production
* Test data mixing with real data
* Test push notifications reaching production users
* Accidental changes affecting production

Each environment has its own Firebase configuration and credentials.

---

# Useful Commands

| Command                      | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `npm install`                | Install dependencies                                   |
| `npm run start:dev`          | Start Metro for development                            |
| `npm run android:dev`        | Run Android development build                          |
| `npm run ios:dev`            | Run iOS development build                              |
| `npm run start:staging`      | Start Metro for staging                                |
| `npm run android:staging`    | Run Android staging build                              |
| `npm run ios:staging`        | Run iOS staging build                                  |
| `npm run start:production`   | Start Metro for production                             |
| `npm run android:production` | Run Android production build                           |
| `npm run ios:production`     | Run iOS production build                               |
| `npm run firebase:sync`      | Copy Firebase configuration for the active environment |

---

# Summary

The application is designed around one main principle:

> **The user should be able to manage tasks whether the device is online or offline.**

Realm handles local persistence and remains the source of truth for the UI.

Firebase provides authentication, cloud synchronization, and push notifications.

The responsibilities are intentionally separated:

```text
Screens
    ↓
UI only

Redux / Hooks
    ↓
Application state

Services
    ↓
Business logic

Repositories
    ↓
Data access

Realm
    ↓
Local source of truth

Firebase
    ↓
Authentication + remote sync + push
```

This structure keeps the application modular, easier to maintain, and easier to extend as new features are added.
