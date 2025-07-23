# 🔍 **CORS and API Debug Guide**

## **Suspected Issue: CORS Mismatch**

The backend CORS is configured for `http://localhost:3000`, but Vite (frontend) typically runs on `http://localhost:5173`.

## **Quick Test Steps:**

### 1. **Check Frontend Port**
Look at your browser URL bar:
- ✅ If it shows `http://localhost:3000` → CORS should work
- ❌ If it shows `http://localhost:5173` → CORS mismatch!

### 2. **Test Direct API Call**
In the TeacherTodo debug panel, click **"Test Direct API Call"** button and check browser console for:
```
Direct API test status: 200 ✅
OR
Direct API test status: 401/403/500 ❌
```

### 3. **Check Network Tab**
Open DevTools → Network tab → Refresh todo page → Look for:
- `teacher-assignments` request
- Check if it shows CORS error or 401/403

## **Solution Options:**

### **Option A: Fix Backend CORS (Recommended)**
Update `backend/app.js` line ~112:
```javascript
// FROM:
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// TO:
app.use(cors({ 
  origin: ['http://localhost:3000', 'http://localhost:5173'], 
  credentials: true 
}));
```

### **Option B: Change Frontend Port**
In `frontend/` folder, create `.env` file:
```
PORT=3000
```

### **Option C: Check Authentication**
If CORS is not the issue, the problem might be:
1. **Not logged in properly** - Check if teacher cookies exist
2. **Session expired** - Try logging out and back in
3. **Backend not running** - Verify `http://localhost:8080` is accessible

## **Debug Commands:**

### **Check Backend Status:**
```bash
curl http://localhost:8080/teacher/stats
```

### **Check Cookies (DevTools):**
1. F12 → Application → Cookies → localhost
2. Look for `teacherToken` cookie
3. Verify it's not expired

### **Manual API Test:**
```javascript
fetch('http://localhost:8080/assignment/teacher-assignments', {
  method: 'GET',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
}).then(r => r.json()).then(console.log).catch(console.error)
```

## **Expected Working Flow:**
1. Frontend (port 3000 or 5173) → Backend (port 8080)
2. Cookies sent with request
3. Backend validates teacher authentication
4. Returns assignments with submissions
5. Todo page shows pending work

Try the debug steps above and let me know what you find! 🔍
