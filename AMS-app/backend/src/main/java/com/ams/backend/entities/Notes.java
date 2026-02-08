package com.ams.backend.entities;

public class Notes {

    private String notesId;
    private String subjectId;
    private String teacherId;
    private String title;
    private String description;
    private String fileUrl; // Firebase Storage URL
    private String fileType; // "PDF", "DOCX", "PPT", etc.
    private long fileSize; // Size in bytes
    private int downloads; // Download count
    private long createdAt;
    private long lastUpdated;
    private boolean isPublished;

    public Notes() {}

    public Notes(String notesId, String subjectId, String teacherId,
                 String title, String description) {
        this.notesId = notesId;
        this.subjectId = subjectId;
        this.teacherId = teacherId;
        this.title = title;
        this.description = description;
        this.createdAt = System.currentTimeMillis();
        this.lastUpdated = this.createdAt;
        this.isPublished = false;
    }

    public void incrementDownloads() {
        this.downloads++;
        this.lastUpdated = System.currentTimeMillis();
    }

    public void setFileDetails(String fileUrl, String fileType, long fileSize) {
        this.fileUrl = fileUrl;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.lastUpdated = System.currentTimeMillis();
    }

    public void publish() {
        this.isPublished = true;
        this.lastUpdated = System.currentTimeMillis();
    }

    public void setPublished(boolean published) {
        isPublished = published;
        this.lastUpdated = System.currentTimeMillis();
    }

    // Getters
    public String getNotesId() { return notesId; }
    public String getSubjectId() { return subjectId; }
    public String getTeacherId() { return teacherId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getFileUrl() { return fileUrl; }
    public String getFileType() { return fileType; }
    public long getFileSize() { return fileSize; }
    public int getDownloads() { return downloads; }
    public boolean isPublished() { return isPublished; }
    public long getCreatedAt() { return createdAt; }
    public long getLastUpdated() { return lastUpdated; }
}
