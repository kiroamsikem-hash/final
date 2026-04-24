# Test Plan: Polling Fix Verification

## 🎯 Objective
Verify that photos, tags, notes, and events persist after adding them and waiting for polling cycles.

## 🧪 Test Cases

### Test 1: Photo Persistence
**Steps:**
1. Open https://anatoliarchieve.info
2. Click on any cell (e.g., Minoan civilization, year 1500 BC)
3. Go to "Photos" tab
4. Click "Add" button
5. Select a photo from your device
6. **Wait 10 seconds** (2 polling cycles)
7. Verify photo is still visible

**Expected Result:** ✅ Photo remains in the cell  
**Actual Result:** _____________

---

### Test 2: Multiple Photos
**Steps:**
1. In the same cell, add 3 more photos
2. **Wait 10 seconds** after each photo
3. Verify all 4 photos are still there

**Expected Result:** ✅ All 4 photos remain  
**Actual Result:** _____________

---

### Test 3: Tag Persistence
**Steps:**
1. Go to "Tags" tab
2. Type "test-tag" in the input
3. Click the + button
4. **Wait 10 seconds**
5. Verify tag is still there

**Expected Result:** ✅ Tag remains  
**Actual Result:** _____________

---

### Test 4: Notes Persistence
**Steps:**
1. Go to "Notes" tab
2. Type "This is a test note for polling fix"
3. Click "Save" button
4. **Wait 10 seconds**
5. Refresh the page
6. Open the same cell
7. Go to "Notes" tab
8. Verify note is still there

**Expected Result:** ✅ Note persists after refresh  
**Actual Result:** _____________

---

### Test 5: Event Persistence
**Steps:**
1. Go to "Events" tab
2. Click "Add Event" button
3. Fill in:
   - Title: "Test Event"
   - Description: "Testing polling fix"
   - Start Year: 1500
   - End Year: 1500
   - Period: "Bronze Age"
4. Click "Create Event"
5. **Wait 10 seconds**
6. Verify event is still in the list

**Expected Result:** ✅ Event remains  
**Actual Result:** _____________

---

### Test 6: Cross-Device Sync
**Steps:**
1. Open https://anatoliarchieve.info on Computer A
2. Open https://anatoliarchieve.info on Computer B (or another browser)
3. On Computer A: Add a photo to a cell
4. On Computer B: **Wait 10 seconds**
5. On Computer B: Verify the photo appears

**Expected Result:** ✅ Photo syncs to Computer B  
**Actual Result:** _____________

---

### Test 7: Rapid Operations
**Steps:**
1. Add a photo
2. Immediately add a tag
3. Immediately add a note
4. **Wait 15 seconds**
5. Verify all 3 items are still there

**Expected Result:** ✅ All items persist  
**Actual Result:** _____________

---

### Test 8: Console Log Verification
**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Add a photo to a cell
4. Watch for console logs

**Expected Logs:**
```
⏸️ Skipping poll - save in progress
⏸️ Skipping poll - save in progress
🔄 Updating cellData from database (after 2 seconds)
```

**Actual Logs:** _____________

---

## 📊 Test Results Summary

| Test Case | Status | Notes |
|-----------|--------|-------|
| Photo Persistence | ⬜ | |
| Multiple Photos | ⬜ | |
| Tag Persistence | ⬜ | |
| Notes Persistence | ⬜ | |
| Event Persistence | ⬜ | |
| Cross-Device Sync | ⬜ | |
| Rapid Operations | ⬜ | |
| Console Logs | ⬜ | |

**Legend:**
- ✅ Pass
- ❌ Fail
- ⬜ Not Tested

---

## 🐛 Issues Found

_Document any issues discovered during testing:_

1. _____________
2. _____________
3. _____________

---

## 📝 Notes

- Polling interval: 5 seconds
- Save grace period: 2 seconds
- Test performed by: _____________
- Date: _____________
- Browser: _____________
- Device: _____________

---

## ✅ Sign-Off

**Tester:** _____________  
**Date:** _____________  
**Status:** ⬜ PASS / ⬜ FAIL  

**Comments:**
_____________________________________________
_____________________________________________
_____________________________________________
