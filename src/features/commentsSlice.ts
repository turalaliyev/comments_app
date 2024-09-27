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

const initialState: CommentsState = {
  comments: [],
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
    },
    deleteComment: (state, action: PayloadAction<number>) => {
      state.comments = state.comments.filter(
        (comment) => comment.id !== action.payload
      );
    },
    likeComment: (state, action: PayloadAction<number>) => {
      const comment = state.comments.find(
        (comment) => comment.id === action.payload
      );
      if (comment) {
        comment.likes += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload.map((comment: Comment) => ({
          ...comment,
        }));
        state.loading = false;
      });
  },
});

export const { addComment, deleteComment, likeComment } = commentsSlice.actions;
export default commentsSlice.reducer;
