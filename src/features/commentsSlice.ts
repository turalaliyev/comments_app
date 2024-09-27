import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface User {
  id: number;
  fullName: string;
  username: string;
}

export interface Comment {
  id: number;
  body: string;
  user: User;
  likes: number;
}

interface CommentsState {
  comments: Comment[];
  loading: boolean;
}

const COMMENTS_STORAGE_KEY = "commentsData";

const loadCommentsFromLocalStorage = (): Comment[] => {
  const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
  return savedComments ? JSON.parse(savedComments) : [];
};

const saveCommentsToLocalStorage = (comments: Comment[]) => {
  localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
};

const initialState: CommentsState = {
  comments: loadCommentsFromLocalStorage(),
  loading: false,
};

export const fetchComments = createAsyncThunk(
  "comments/fetchComments",
  async () => {
    const response = await axios.get("https://dummyjson.com/comments");
    return response.data.comments;
  }
);

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.unshift(action.payload);
      saveCommentsToLocalStorage(state.comments);
    },
    deleteComment: (state, action: PayloadAction<number>) => {
      state.comments = state.comments.filter(
        (comment) => comment.id !== action.payload
      );
      saveCommentsToLocalStorage(state.comments);
    },
    likeComment: (state, action: PayloadAction<number>) => {
      const comment = state.comments.find(
        (comment) => comment.id === action.payload
      );
      if (comment) {
        comment.likes += 1;
        saveCommentsToLocalStorage(state.comments);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        if (state.comments.length === 0) {
          state.comments = action.payload.map((comment: Comment) => ({
            ...comment,
          }));
          saveCommentsToLocalStorage(state.comments);
        }
        state.loading = false;
      });
  },
});

export const { addComment, deleteComment, likeComment } = commentsSlice.actions;
export default commentsSlice.reducer;
