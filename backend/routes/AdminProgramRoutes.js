const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

const Program = require("../models/Program");
const Semester = require("../models/Semester");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const Note = require("../models/Note");
const { isAdmin, hasPermission } = require("../middleware/auth");

// ==================== PROGRAM MANAGEMENT ====================

// Get all programs
router.get("/programs", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "", category = "" } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "published") query.isPublished = true;
    else if (status === "draft") query.isPublished = false;

    if (category) query.category = category;

    const programs = await Program.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('semesters');

    const total = await Program.countDocuments(query);

    // Get stats for each program
    const programsWithStats = await Promise.all(programs.map(async (program) => {
      const programObj = program.toObject();
      const semesters = await Semester.find({ programId: program._id });
      let totalBooks = 0;
      let totalChapters = 0;

      for (const semester of semesters) {
        const books = await Book.find({ semesterId: semester._id });
        totalBooks += books.length;
        for (const book of books) {
          const chapters = await Chapter.find({ bookId: book._id });
          totalChapters += chapters.length;
        }
      }

      programObj.totalSemesters = semesters.length;
      programObj.totalBooks = totalBooks;
      programObj.totalChapters = totalChapters;
      return programObj;
    }));

    res.json({
      success: true,
      programs: programsWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get programs error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get single program with full details
router.get("/programs/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: "Program not found" });
    }

    const semesters = await Semester.find({ programId: program._id })
      .sort({ semesterNumber: 1 })
      .populate({
        path: 'books',
        populate: {
          path: 'chapters',
          populate: {
            path: 'notes',
          },
        },
      });

    const programObj = program.toObject();
    programObj.semesters = semesters;

    res.json({
      success: true,
      program: programObj,
    });
  } catch (error) {
    console.error("Get program error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create program
router.post("/programs", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const { title, description, category, duration, thumbnail } = req.body;

    let thumbnailUrl = thumbnail;
    if (thumbnail && thumbnail.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(thumbnail, {
        folder: 'program_thumbnails',
        width: 1200,
        height: 630,
        crop: 'limit',
        quality: 'auto',
      });
      thumbnailUrl = uploadResponse.secure_url;
    }

    const program = new Program({
      title,
      description,
      category,
      duration,
      thumbnail: thumbnailUrl,
    });

    await program.save();

    res.status(201).json({
      success: true,
      message: "Program created successfully",
      program,
    });
  } catch (error) {
    console.error("Create program error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update program
router.put("/programs/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: "Program not found" });
    }

    const updates = req.body;

    if (updates.thumbnail && updates.thumbnail.startsWith('data:image')) {
      // Delete old thumbnail from cloudinary if exists
      if (program.thumbnail) {
        try {
          const publicId = program.thumbnail.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`program_thumbnails/${publicId}`);
        } catch (err) {
          console.log("Cloudinary delete error:", err);
        }
      }

      const uploadResponse = await cloudinary.uploader.upload(updates.thumbnail, {
        folder: 'program_thumbnails',
        width: 1200,
        height: 630,
        crop: 'limit',
        quality: 'auto',
      });
      updates.thumbnail = uploadResponse.secure_url;
    }

    Object.assign(program, updates);
    await program.save();

    res.json({
      success: true,
      message: "Program updated successfully",
      program,
    });
  } catch (error) {
    console.error("Update program error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete program
router.delete("/programs/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: "Program not found" });
    }

    // Delete all semesters, books, chapters, notes
    const semesters = await Semester.find({ programId: program._id });
    for (const semester of semesters) {
      const books = await Book.find({ semesterId: semester._id });
      for (const book of books) {
        const chapters = await Chapter.find({ bookId: book._id });
        for (const chapter of chapters) {
          const notes = await Note.find({ chapterId: chapter._id });
          for (const note of notes) {
            // Delete attachments from cloudinary
            if (note.attachments && note.attachments.length > 0) {
              for (const attachment of note.attachments) {
                if (attachment.publicId) {
                  try {
                    await cloudinary.uploader.destroy(attachment.publicId);
                  } catch (err) {
                    console.log("Cloudinary delete error:", err);
                  }
                }
              }
            }
            await note.deleteOne();
          }
          await chapter.deleteOne();
        }
        await book.deleteOne();
      }
      await semester.deleteOne();
    }

    // Delete program thumbnail
    if (program.thumbnail) {
      try {
        const publicId = program.thumbnail.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`program_thumbnails/${publicId}`);
      } catch (err) {
        console.log("Cloudinary delete error:", err);
      }
    }

    await program.deleteOne();

    res.json({
      success: true,
      message: "Program deleted successfully",
    });
  } catch (error) {
    console.error("Delete program error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Publish/Unpublish program
router.put("/programs/:id/publish", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: "Program not found" });
    }

    const { isPublished } = req.body;
    program.isPublished = isPublished;
    if (isPublished) {
      program.publishedAt = new Date();
    }
    await program.save();

    res.json({
      success: true,
      message: `Program ${isPublished ? 'published' : 'unpublished'} successfully`,
      program,
    });
  } catch (error) {
    console.error("Publish program error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== SEMESTER MANAGEMENT ====================

// Get semesters for a program
router.get("/programs/:programId/semesters", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const semesters = await Semester.find({ programId: req.params.programId })
      .sort({ semesterNumber: 1 });
    res.json({ success: true, semesters });
  } catch (error) {
    console.error("Get semesters error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create semester
router.post("/semesters", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const { programId, title, description, semesterNumber, duration } = req.body;

    const program = await Program.findById(programId);
    if (!program) {
      return res.status(404).json({ success: false, message: "Program not found" });
    }

    // Check if semester number already exists
    const existingSemester = await Semester.findOne({ programId, semesterNumber });
    if (existingSemester) {
      return res.status(400).json({
        success: false,
        message: `Semester ${semesterNumber} already exists for this program`,
      });
    }

    const semester = new Semester({
      programId,
      title,
      description,
      semesterNumber,
      duration,
      order: semesterNumber,
    });

    await semester.save();

    program.semesters.push(semester._id);
    program.totalSemesters = (program.totalSemesters || 0) + 1;
    await program.save();

    res.status(201).json({
      success: true,
      message: "Semester created successfully",
      semester,
    });
  } catch (error) {
    console.error("Create semester error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update semester
router.put("/semesters/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).json({ success: false, message: "Semester not found" });
    }

    const updates = req.body;

    // If semester number is changing, check for conflicts
    if (updates.semesterNumber && updates.semesterNumber !== semester.semesterNumber) {
      const existing = await Semester.findOne({
        programId: semester.programId,
        semesterNumber: updates.semesterNumber,
        _id: { $ne: semester._id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Semester ${updates.semesterNumber} already exists for this program`,
        });
      }
    }

    Object.assign(semester, updates);
    if (updates.semesterNumber) {
      semester.order = updates.semesterNumber;
    }
    await semester.save();

    res.json({
      success: true,
      message: "Semester updated successfully",
      semester,
    });
  } catch (error) {
    console.error("Update semester error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete semester
router.delete("/semesters/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).json({ success: false, message: "Semester not found" });
    }

    // Delete all books, chapters, notes
    const books = await Book.find({ semesterId: semester._id });
    for (const book of books) {
      const chapters = await Chapter.find({ bookId: book._id });
      for (const chapter of chapters) {
        const notes = await Note.find({ chapterId: chapter._id });
        for (const note of notes) {
          // Delete attachments from cloudinary
          if (note.attachments && note.attachments.length > 0) {
            for (const attachment of note.attachments) {
              if (attachment.publicId) {
                try {
                  await cloudinary.uploader.destroy(attachment.publicId);
                } catch (err) {
                  console.log("Cloudinary delete error:", err);
                }
              }
            }
          }
          await note.deleteOne();
        }
        await chapter.deleteOne();
      }
      await book.deleteOne();
    }

    // Remove from program
    await Program.updateOne(
      { _id: semester.programId },
      { $pull: { semesters: semester._id }, $inc: { totalSemesters: -1 } }
    );

    await semester.deleteOne();

    res.json({
      success: true,
      message: "Semester deleted successfully",
    });
  } catch (error) {
    console.error("Delete semester error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== BOOK MANAGEMENT ====================

// Get books for a semester
router.get("/semesters/:semesterId/books", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const books = await Book.find({ semesterId: req.params.semesterId })
      .sort({ order: 1 });
    res.json({ success: true, books });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create book
router.post("/books", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const { semesterId, title, description, bookCover, authors, edition, publisher, isbn, order } = req.body;

    const semester = await Semester.findById(semesterId);
    if (!semester) {
      return res.status(404).json({ success: false, message: "Semester not found" });
    }

    let bookCoverUrl = bookCover || '';
    if (bookCover && bookCover.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(bookCover, {
        folder: 'book_covers',
        width: 400,
        height: 600,
        crop: 'limit',
        quality: 'auto',
      });
      bookCoverUrl = uploadResponse.secure_url;
    }

    const book = new Book({
      semesterId,
      programId: semester.programId,
      title,
      description,
      bookCover: bookCoverUrl,
      authors: authors || [],
      edition,
      publisher,
      isbn,
      order: order || 0,
    });

    await book.save();

    semester.books.push(book._id);
    semester.totalBooks = (semester.totalBooks || 0) + 1;
    await semester.save();

    // Update program total books
    await Program.updateOne(
      { _id: semester.programId },
      { $inc: { totalBooks: 1 } }
    );

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    console.error("Create book error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update book
router.put("/books/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    const updates = req.body;

    if (updates.bookCover && updates.bookCover.startsWith('data:image')) {
      // Delete old cover from cloudinary if exists
      if (book.bookCover) {
        try {
          const publicId = book.bookCover.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`book_covers/${publicId}`);
        } catch (err) {
          console.log("Cloudinary delete error:", err);
        }
      }

      const uploadResponse = await cloudinary.uploader.upload(updates.bookCover, {
        folder: 'book_covers',
        width: 400,
        height: 600,
        crop: 'limit',
        quality: 'auto',
      });
      updates.bookCover = uploadResponse.secure_url;
    }

    Object.assign(book, updates);
    await book.save();

    res.json({
      success: true,
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete book
router.delete("/books/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // Delete all chapters and notes
    const chapters = await Chapter.find({ bookId: book._id });
    for (const chapter of chapters) {
      const notes = await Note.find({ chapterId: chapter._id });
      for (const note of notes) {
        if (note.attachments && note.attachments.length > 0) {
          for (const attachment of note.attachments) {
            if (attachment.publicId) {
              try {
                await cloudinary.uploader.destroy(attachment.publicId);
              } catch (err) {
                console.log("Cloudinary delete error:", err);
              }
            }
          }
        }
        await note.deleteOne();
      }
      await chapter.deleteOne();
    }

    // Remove from semester
    await Semester.updateOne(
      { _id: book.semesterId },
      { $pull: { books: book._id }, $inc: { totalBooks: -1 } }
    );

    // Update program
    await Program.updateOne(
      { _id: book.programId },
      { $inc: { totalBooks: -1 } }
    );

    // Delete book cover
    if (book.bookCover) {
      try {
        const publicId = book.bookCover.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`book_covers/${publicId}`);
      } catch (err) {
        console.log("Cloudinary delete error:", err);
      }
    }

    await book.deleteOne();

    res.json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.error("Delete book error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== CHAPTER MANAGEMENT ====================

// Get chapters for a book
router.get("/books/:bookId/chapters", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const chapters = await Chapter.find({ bookId: req.params.bookId })
      .sort({ chapterNumber: 1 });
    res.json({ success: true, chapters });
  } catch (error) {
    console.error("Get chapters error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create chapter
router.post("/chapters", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const {
      bookId,
      title,
      description,
      chapterNumber,
      whatYouWillLearn,
      topics,
      order,
    } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // Check if chapter number already exists
    const existingChapter = await Chapter.findOne({ bookId, chapterNumber });
    if (existingChapter) {
      return res.status(400).json({
        success: false,
        message: `Chapter ${chapterNumber} already exists for this book`,
      });
    }

    const chapter = new Chapter({
      bookId,
      semesterId: book.semesterId,
      programId: book.programId,
      title,
      description,
      chapterNumber,
      whatYouWillLearn: whatYouWillLearn || [],
      topics: topics || [],
      order: order || chapterNumber,
    });

    await chapter.save();

    book.chapters.push(chapter._id);
    book.totalChapters = (book.totalChapters || 0) + 1;
    await book.save();

    // Update program
    await Program.updateOne(
      { _id: book.programId },
      { $inc: { totalChapters: 1 } }
    );

    res.status(201).json({
      success: true,
      message: "Chapter created successfully",
      chapter,
    });
  } catch (error) {
    console.error("Create chapter error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update chapter
router.put("/chapters/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Chapter not found" });
    }

    const updates = req.body;

    // If chapter number is changing, check for conflicts
    if (updates.chapterNumber && updates.chapterNumber !== chapter.chapterNumber) {
      const existing = await Chapter.findOne({
        bookId: chapter.bookId,
        chapterNumber: updates.chapterNumber,
        _id: { $ne: chapter._id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Chapter ${updates.chapterNumber} already exists for this book`,
        });
      }
    }

    Object.assign(chapter, updates);
    if (updates.chapterNumber) {
      chapter.order = updates.chapterNumber;
    }
    await chapter.save();

    res.json({
      success: true,
      message: "Chapter updated successfully",
      chapter,
    });
  } catch (error) {
    console.error("Update chapter error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete chapter
router.delete("/chapters/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Chapter not found" });
    }

    // Delete all notes
    const notes = await Note.find({ chapterId: chapter._id });
    for (const note of notes) {
      if (note.attachments && note.attachments.length > 0) {
        for (const attachment of note.attachments) {
          if (attachment.publicId) {
            try {
              await cloudinary.uploader.destroy(attachment.publicId);
            } catch (err) {
              console.log("Cloudinary delete error:", err);
            }
          }
        }
      }
      await note.deleteOne();
    }

    // Remove from book
    await Book.updateOne(
      { _id: chapter.bookId },
      { $pull: { chapters: chapter._id }, $inc: { totalChapters: -1 } }
    );

    // Update program
    await Program.updateOne(
      { _id: chapter.programId },
      { $inc: { totalChapters: -1 } }
    );

    await chapter.deleteOne();

    res.json({
      success: true,
      message: "Chapter deleted successfully",
    });
  } catch (error) {
    console.error("Delete chapter error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== NOTE MANAGEMENT ====================

// Get notes for a chapter
router.get("/chapters/:chapterId/notes", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const notes = await Note.find({ chapterId: req.params.chapterId })
      .sort({ order: 1 });
    res.json({ success: true, notes });
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create note with file upload
router.post("/notes", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const {
      chapterId,
      title,
      description,
      content,
      attachments,
      videoUrl,
      pdfUrl,
      links,
      tags,
      isImportant,
      order,
    } = req.body;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ success: false, message: "Chapter not found" });
    }

    // Process attachments and upload to cloudinary
    const processedAttachments = [];
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        let processedAttachment = { ...attachment };

        // If it's a file (base64), upload to cloudinary
        if (attachment.url && attachment.url.startsWith('data:')) {
          try {
            let resourceType = 'auto';
            let folder = 'note_attachments';

            // Determine resource type
            if (attachment.type === 'image') {
              resourceType = 'image';
              folder = 'note_images';
            } else if (attachment.type === 'video') {
              resourceType = 'video';
              folder = 'note_videos';
            } else if (attachment.type === 'pdf') {
              resourceType = 'raw';
              folder = 'note_pdfs';
            } else {
              resourceType = 'raw';
              folder = 'note_files';
            }

            const uploadResponse = await cloudinary.uploader.upload(attachment.url, {
              folder: folder,
              resource_type: resourceType,
              quality: 'auto',
            });

            processedAttachment.url = uploadResponse.secure_url;
            processedAttachment.publicId = uploadResponse.public_id;
          } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            // Keep original URL if upload fails
            processedAttachment.publicId = null;
          }
        }

        processedAttachments.push(processedAttachment);
      }
    }

    // Process video URL if provided and is base64
    let processedVideoUrl = videoUrl || '';
    if (videoUrl && videoUrl.startsWith('data:video')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(videoUrl, {
          folder: 'note_videos',
          resource_type: 'video',
          quality: 'auto',
        });
        processedVideoUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary video upload error:", uploadError);
      }
    }

    // Process PDF URL if provided and is base64
    let processedPdfUrl = pdfUrl || '';
    if (pdfUrl && pdfUrl.startsWith('data:application/pdf')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(pdfUrl, {
          folder: 'note_pdfs',
          resource_type: 'raw',
          quality: 'auto',
        });
        processedPdfUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary PDF upload error:", uploadError);
      }
    }

    const note = new Note({
      chapterId,
      bookId: chapter.bookId,
      semesterId: chapter.semesterId,
      programId: chapter.programId,
      title,
      description,
      content: content || '',
      attachments: processedAttachments,
      videoUrl: processedVideoUrl,
      pdfUrl: processedPdfUrl,
      links: links || [],
      tags: tags || [],
      isImportant: isImportant || false,
      order: order || 0,
    });

    await note.save();

    chapter.notes.push(note._id);
    chapter.totalNotes = (chapter.totalNotes || 0) + 1;
    await chapter.save();

    res.status(201).json({
      success: true,
      message: "Note created successfully",
      note,
    });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update note
router.put("/notes/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    const updates = req.body;

    // Process new attachments
    if (updates.attachments && updates.attachments.length > 0) {
      const processedAttachments = [];
      for (const attachment of updates.attachments) {
        let processedAttachment = { ...attachment };

        if (attachment.url && attachment.url.startsWith('data:')) {
          try {
            let resourceType = 'auto';
            let folder = 'note_attachments';

            if (attachment.type === 'image') {
              resourceType = 'image';
              folder = 'note_images';
            } else if (attachment.type === 'video') {
              resourceType = 'video';
              folder = 'note_videos';
            } else if (attachment.type === 'pdf') {
              resourceType = 'raw';
              folder = 'note_pdfs';
            } else {
              resourceType = 'raw';
              folder = 'note_files';
            }

            const uploadResponse = await cloudinary.uploader.upload(attachment.url, {
              folder: folder,
              resource_type: resourceType,
              quality: 'auto',
            });

            processedAttachment.url = uploadResponse.secure_url;
            processedAttachment.publicId = uploadResponse.public_id;
          } catch (uploadError) {
            console.error("Cloudinary upload error:", uploadError);
            processedAttachment.publicId = null;
          }
        }
        processedAttachments.push(processedAttachment);
      }
      updates.attachments = processedAttachments;
    }

    // Process video URL
    if (updates.videoUrl && updates.videoUrl.startsWith('data:video')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(updates.videoUrl, {
          folder: 'note_videos',
          resource_type: 'video',
          quality: 'auto',
        });
        updates.videoUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary video upload error:", uploadError);
      }
    }

    // Process PDF URL
    if (updates.pdfUrl && updates.pdfUrl.startsWith('data:application/pdf')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(updates.pdfUrl, {
          folder: 'note_pdfs',
          resource_type: 'raw',
          quality: 'auto',
        });
        updates.pdfUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary PDF upload error:", uploadError);
      }
    }

    Object.assign(note, updates);
    await note.save();

    res.json({
      success: true,
      message: "Note updated successfully",
      note,
    });
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete note
router.delete("/notes/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    // Delete attachments from cloudinary
    if (note.attachments && note.attachments.length > 0) {
      for (const attachment of note.attachments) {
        if (attachment.publicId) {
          try {
            await cloudinary.uploader.destroy(attachment.publicId);
          } catch (err) {
            console.log("Cloudinary delete error:", err);
          }
        }
      }
    }

    // Delete video from cloudinary
    if (note.videoUrl) {
      try {
        const publicId = note.videoUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      } catch (err) {
        console.log("Cloudinary video delete error:", err);
      }
    }

    // Delete PDF from cloudinary
    if (note.pdfUrl) {
      try {
        const publicId = note.pdfUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      } catch (err) {
        console.log("Cloudinary PDF delete error:", err);
      }
    }

    // Remove from chapter
    await Chapter.updateOne(
      { _id: note.chapterId },
      { $pull: { notes: note._id }, $inc: { totalNotes: -1 } }
    );

    await note.deleteOne();

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ==================== SEMESTER MANAGEMENT ====================

// Get single semester
router.get("/semesters/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const semester = await Semester.findById(req.params.id)
      .populate('books');
    
    if (!semester) {
      return res.status(404).json({
        success: false,
        message: "Semester not found"
      });
    }
    
    res.json({
      success: true,
      semester,
    });
  } catch (error) {
    console.error("Get semester error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get single book
router.get("/books/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('chapters');
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }
    
    res.json({
      success: true,
      book,
    });
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get single chapter
router.get("/chapters/:id", isAdmin, hasPermission("manageCourses"), async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id)
      .populate('notes');
    
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found"
      });
    }
    
    res.json({
      success: true,
      chapter,
    });
  } catch (error) {
    console.error("Get chapter error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;