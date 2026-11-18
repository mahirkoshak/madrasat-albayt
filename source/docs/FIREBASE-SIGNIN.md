# Parent sign-in with Google and Apple: one-time Firebase setup

**Status (18 Nov 2026):** Google is on. The site's address is allowed and the `parents` rule is published. Apple is still off.

The site already uses Firebase (project `madrasat-albayt`) to keep the children, diamonds and progress the same on every device. A parent can now sign in with Google or Apple. Signing in on any device joins the family, and the parent can work from their own phone:

- watch progress live;
- approve gift requests;
- change a child's grade and hard subjects.

The code is done. Firebase only needs three settings switched on in its console.

## 1. Turn on Google sign-in (free, about 2 minutes)

1. Open https://console.firebase.google.com and choose the project **madrasat-albayt**.
2. In the left menu, open **Build → Authentication**, then the **Sign-in method** tab.
3. Click **Add new provider**, then **Google**, then switch **Enable** on.
4. Choose your email as the **support email**, then click **Save**.

## 2. Allow the site's address

Still in **Authentication**, open the **Settings** tab, then **Authorized domains**, then **Add domain**, and add:

```
mahirkoshak.github.io
```

`localhost` and `madrasat-albayt.firebaseapp.com` are usually there already. Leave them.

## 3. Let each parent read only their own family link

Open **Build → Firestore Database**, then the **Rules** tab. Inside the existing `match /databases/{database}/documents { … }` block, add these lines next to the rules for `families`:

```
    // parents/{uid}: which family a signed-in parent belongs to. Only that parent can read or change it.
    match /parents/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
```

Then click **Publish**. The rules for `families` stay as they are.

## 4. Apple sign-in (optional; needs a paid Apple Developer account)

Apple requires an Apple Developer membership (99 USD a year) to offer "Sign in with Apple" on a website. Without it, the Apple button shows an error and Google keeps working.

If you have the membership:

1. In Firebase, go to **Authentication → Sign-in method → Add new provider → Apple → Enable**.
2. In https://developer.apple.com go to **Certificates, IDs & Profiles**, then:
   1. Create a **Services ID**, for example `com.madrasat.albayt.web`.
   2. Turn on **Sign in with Apple** for it.
   3. Under **Domains**, add `madrasat-albayt.firebaseapp.com`.
   4. Under **Return URLs**, add `https://madrasat-albayt.firebaseapp.com/__/auth/handler`.
3. In Apple, create a **Key** with **Sign in with Apple** enabled and download it.
4. Back in Firebase's Apple settings, paste the Services ID, your Team ID, the Key ID and the key file's contents. Save.

If you'd rather skip Apple, I can hide the Apple button. iPhone users can sign in with Google too.

## How families use it

1. On your phone, open the site, then the lock 🔒, then **Sign in with Google**. A family is created from the children on this device. If you have signed in before, you join your existing family.
2. On each child's device, open the lock, sign in with the same Google account, and the same children appear. Sign in once and the device stays signed in.
3. To control things from your phone, open the lock on your phone:
   - each child's progress updates live;
   - gift requests show a red number on the lock and can be approved or refunded there;
   - **✏️ Grade and hard subjects** changes what earns diamonds on the child's device.

The family code and join link still work, under **Other ways: family code**.
