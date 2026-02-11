# Firebase Setup Guide for Cloudy

This guide will help you set up Firebase for your Cloudy messaging app.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: **cloudy-messenger** (or your choice)
4. Disable Google Analytics (optional for this app)
5. Click "Create project"

## Step 2: Register Your App

1. In Firebase Console, click the **Web icon** (</>)
2. Register app name: **Cloudy Web App**
3. Copy the Firebase configuration object

## Step 3: Configure Firebase in Your App

Open `config/firebase.ts` and replace the configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

## Step 4: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable these providers:
   - ✅ **Email/Password** (for basic auth)
   - ✅ **Phone** (for OTP verification) - Optional
   - ✅ **Google** (for social login) - Optional

## Step 5: Set Up Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Production mode** (we'll configure rules next)
3. Select your preferred location (closest to your users)
4. Click "Enable"

### Firestore Security Rules

Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Private IDs mapping
    match /privateIds/{privateId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Chats collection
    match /chats/{chatId} {
      allow read: if request.auth != null &&
                     request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                              request.auth.uid in resource.data.participants;

      // Messages subcollection
      match /messages/{messageId} {
        allow read: if request.auth != null &&
                       request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create: if request.auth != null &&
                         request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow update, delete: if request.auth != null &&
                                 request.auth.uid == resource.data.senderId;
      }
    }
  }
}
```

## Step 6: Set Up Firebase Storage

1. Go to **Storage** → **Get started**
2. Choose **Production mode**
3. Select the same location as Firestore
4. Click "Done"

### Storage Security Rules

Replace the default rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{chatId}/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.resource.size < 5 * 1024 * 1024 &&
                      request.resource.contentType.matches('image/.*');
    }

    match /voice/{chatId}/{voiceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                      request.resource.size < 10 * 1024 * 1024 &&
                      request.resource.contentType.matches('audio/.*');
    }
  }
}
```

## Firestore Database Structure

### Collections:

#### `users/{userId}`

```json
{
  "id": "firebase-uid",
  "privateId": "@username",
  "name": "User Name",
  "email": "user@example.com",
  "avatar": "https://...",
  "isOnline": true,
  "lastSeen": Timestamp,
  "bio": "Status message",
  "isPublic": false,
  "createdAt": Timestamp
}
```

#### `privateIds/{privateId}`

```json
{
  "userId": "firebase-uid"
}
```

#### `chats/{chatId}`

```json
{
  "participants": ["userId1", "userId2"],
  "lastMessage": {
    "content": "Last message text",
    "senderId": "userId",
    "timestamp": Timestamp
  },
  "unreadCount_userId1": 0,
  "unreadCount_userId2": 3,
  "isVanishMode": false,
  "disappearingTime": null,
  "isPinned": false,
  "isArchived": false,
  "createdAt": Timestamp,
  "updatedAt": Timestamp
}
```

#### `chats/{chatId}/messages/{messageId}`

```json
{
  "chatId": "chat-id",
  "senderId": "user-id",
  "content": "Message text or URL",
  "type": "text|image|voice|deleted",
  "timestamp": Timestamp,
  "isRead": false,
  "isVanish": false,
  "expiresAt": Timestamp
}
```

## Cost Estimation (Firebase Free Tier)

### Firestore (Free Tier):

- 50,000 document reads/day ✅
- 20,000 document writes/day ✅
- 20,000 document deletes/day ✅
- 1 GB stored ✅

### Storage (Free Tier):

- 5 GB stored ✅
- 1 GB/day downloads ✅
- 20,000 uploads/day ✅

### Authentication (Free):

- Unlimited users ✅
- 10,000 phone verifications/month (paid after) ⚠️

### Typical Usage (100 active users):

- **Daily reads**: ~5,000-10,000 (well within free tier)
- **Daily writes**: ~2,000-5,000 (well within free tier)
- **Storage**: ~500 MB for images/voice (well within free tier)

**Result**: Your app should run entirely on the FREE tier for up to 500-1000 users! 🎉

## Features Implemented

✅ **Authentication**

- Email/Password sign up and login
- User profile with Private ID
- Real-time online status

✅ **Real-Time Messaging**

- One-to-one chats
- Text, image, and voice messages
- Read receipts and typing indicators (ready for implementation)
- Message timestamps

✅ **Privacy Features**

- Chat locking (stored locally)
- Hidden chats (stored locally)
- Vanish mode
- Disappearing messages (10s, 1m, 1h, 1d)
- Panic wipe (delete all chats)

✅ **Security**

- Firestore security rules
- Local encryption for locks
- Private ID system
- User search by Private ID

## Next Steps

1. Replace Firebase config in `config/firebase.ts`
2. Deploy Firestore and Storage rules
3. Test authentication flow
4. Test messaging features
5. Add push notifications (future)
6. Add group chats (future)

## Troubleshooting

### "Firebase not initialized"

- Check that you replaced the config in `config/firebase.ts`

### "Permission denied" errors

- Deploy the security rules from Step 5 and 6

### "User not found"

- Make sure the user document is created after sign up

### Messages not syncing

- Check internet connection
- Check Firestore rules
- Check browser console for errors

## Support

For issues or questions, check:

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- Your app logs in the browser console
