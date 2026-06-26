// routes/ProgramRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Program = require("../models/Program");
const Semester = require("../models/Semester");
const Book = require("../models/Book");
const Chapter = require("../models/Chapter");
const Note = require("../models/Note");
const { optionalAuth } = require("../middleware/auth");

// ==================== GET ALL PUBLISHED PROGRAMS ====================
router.get("/api/programs", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", category = "" } = req.query;
    const query = { isPublished: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const programs = await Program.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Program.countDocuments(query);

    const programsWithSemesters = await Promise.all(programs.map(async (program) => {
      const programObj = program.toObject();
      
      const semesters = await Semester.find({ 
        programId: program._id
      })
        .sort({ semesterNumber: 1 })
        .lean();
      
      const semestersWithBookCount = await Promise.all(semesters.map(async (semester) => {
        const bookCount = await Book.countDocuments({ 
          semesterId: semester._id
        });
        return {
          ...semester,
          totalBooks: bookCount
        };
      }));
      
      programObj.semesters = semestersWithBookCount;
      programObj.totalSemesters = semestersWithBookCount.length;
      
      return programObj;
    }));

    res.json({
      success: true,
      programs: programsWithSemesters,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get programs error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
});

// ==================== GET SINGLE PROGRAM WITH SEMESTERS ====================
router.get("/api/programs/:id", optionalAuth, async (req, res) => {
  try {
    console.log(`🔍 Fetching program with ID: ${req.params.id}`);
    
    const program = await Program.findOne({ 
      _id: req.params.id, 
      isPublished: true 
    });

    if (!program) {
      console.log(`❌ Program not found with ID: ${req.params.id}`);
      return res.status(404).json({ 
        success: false, 
        message: "Program not found" 
      });
    }

    console.log(`✅ Program found: ${program.title}`);

    const semesters = await Semester.find({ 
      programId: program._id
    })
      .sort({ semesterNumber: 1 })
      .lean();

    console.log(`📚 Found ${semesters.length} semesters for program: ${program.title}`);

    const semestersWithBookCount = await Promise.all(semesters.map(async (semester) => {
      const bookCount = await Book.countDocuments({ 
        semesterId: semester._id
      });
      return {
        ...semester,
        totalBooks: bookCount
      };
    }));

    const programObj = program.toObject();
    programObj.semesters = semestersWithBookCount;
    programObj.totalSemesters = semestersWithBookCount.length;

    res.json({
      success: true,
      program: programObj,
    });
  } catch (error) {
    console.error("Get program error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
});

// ==================== GET ALL SEMESTERS ====================
router.get("/api/semesters", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", programId = "" } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (programId) {
      query.programId = programId;
    }

    const semesters = await Semester.find(query)
      .sort({ semesterNumber: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    const total = await Semester.countDocuments(query);

    const semestersWithDetails = await Promise.all(semesters.map(async (semester) => {
      const program = await Program.findOne({ 
        _id: semester.programId,
        isPublished: true 
      }).select('title category duration thumbnail');

      const bookCount = await Book.countDocuments({ 
        semesterId: semester._id
      });

      return {
        ...semester,
        program: program || null,
        totalBooks: bookCount
      };
    }));

    res.json({
      success: true,
      semesters: semestersWithDetails,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get all semesters error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
});

// ==================== GET SEMESTER WITH BOOKS ====================
router.get("/api/semesters/:id", optionalAuth, async (req, res) => {
  try {
    console.log(`🔍 Fetching semester with ID: ${req.params.id}`);
    
    const semester = await Semester.findOne({ 
      _id: req.params.id
    });

    if (!semester) {
      console.log(`❌ Semester not found with ID: ${req.params.id}`);
      return res.status(404).json({ 
        success: false, 
        message: "Semester not found" 
      });
    }

    console.log(`✅ Semester found: ${semester.title}`);

    const program = await Program.findOne({ 
      _id: semester.programId,
      isPublished: true 
    }).select('title');

    // ✅ FIX: Get all books without isPublished filter
    const books = await Book.find({ 
      semesterId: semester._id
    })
      .sort({ order: 1 })
      .lean();

    console.log(`📚 Found ${books.length} books for semester: ${semester.title}`);
    
    // Log book details for debugging
    if (books.length > 0) {
      console.log(`📚 Books:`, books.map(b => ({ 
        id: b._id, 
        title: b.title,
        isPublished: b.isPublished 
      })));
    }

    const semesterObj = semester.toObject();
    semesterObj.books = books;
    semesterObj.programTitle = program?.title || 'Program';

    res.json({
      success: true,
      semester: semesterObj,
    });
  } catch (error) {
    console.error("Get semester error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// ==================== GET BOOK WITH CHAPTERS ====================
router.get("/api/books/:id", optionalAuth, async (req, res) => {
  try {
    console.log(`🔍 Fetching book with ID: ${req.params.id}`);
    
    const book = await Book.findOne({ 
      _id: req.params.id
    });

    if (!book) {
      console.log(`❌ Book not found with ID: ${req.params.id}`);
      return res.status(404).json({ 
        success: false, 
        message: "Book not found" 
      });
    }

    console.log(`✅ Book found: ${book.title}`);

    const semester = await Semester.findOne({ 
      _id: book.semesterId,
      isPublished: true 
    }).select('title semesterNumber');

    const program = await Program.findOne({ 
      _id: book.programId,
      isPublished: true 
    }).select('title');

    const chapters = await Chapter.find({ 
      bookId: book._id
    })
      .sort({ chapterNumber: 1 })
      .lean();

    console.log(`📚 Found ${chapters.length} chapters for book: ${book.title}`);

    const bookObj = book.toObject();
    bookObj.chapters = chapters;
    bookObj.semesterTitle = semester?.title || '';
    bookObj.semesterNumber = semester?.semesterNumber || '';
    bookObj.programTitle = program?.title || '';

    res.json({
      success: true,
      book: bookObj,
    });
  } catch (error) {
    console.error("Get book error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// ==================== GET CHAPTER WITH NOTES ====================
router.get("/api/chapters/:id", optionalAuth, async (req, res) => {
  try {
    console.log(`🔍 Fetching chapter with ID: ${req.params.id}`);
    
    const chapter = await Chapter.findOne({ 
      _id: req.params.id
    });

    if (!chapter) {
      console.log(`❌ Chapter not found with ID: ${req.params.id}`);
      return res.status(404).json({ 
        success: false, 
        message: "Chapter not found" 
      });
    }

    console.log(`✅ Chapter found: ${chapter.title}`);

    const book = await Book.findOne({ 
      _id: chapter.bookId,
      isPublished: true 
    }).select('title');

    const semester = await Semester.findOne({ 
      _id: chapter.semesterId,
      isPublished: true 
    }).select('title semesterNumber');

    const program = await Program.findOne({ 
      _id: chapter.programId,
      isPublished: true 
    }).select('title');

    const notes = await Note.find({ 
      chapterId: chapter._id
    })
      .sort({ order: 1 })
      .lean();

    console.log(`📚 Found ${notes.length} notes for chapter: ${chapter.title}`);

    const chapterObj = chapter.toObject();
    chapterObj.notes = notes;
    chapterObj.bookTitle = book?.title || '';
    chapterObj.semesterTitle = semester?.title || '';
    chapterObj.semesterNumber = semester?.semesterNumber || '';
    chapterObj.programTitle = program?.title || '';

    res.json({
      success: true,
      chapter: chapterObj,
    });
  } catch (error) {
    console.error("Get chapter error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

// ==================== GET ALL CHAPTERS FOR A BOOK ====================
router.get("/api/books/:bookId/chapters/all", optionalAuth, async (req, res) => {
  try {
    const chapters = await Chapter.find({ 
      bookId: req.params.bookId
    })
      .sort({ chapterNumber: 1 })
      .select('_id title chapterNumber');

    console.log(`📚 Found ${chapters.length} chapters for book ID: ${req.params.bookId}`);

    res.json({
      success: true,
      chapters,
    });
  } catch (error) {
    console.error("Get chapters error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});

module.exports = router;