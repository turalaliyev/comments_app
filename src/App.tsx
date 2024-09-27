import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
  fetchComments,
  addComment,
  deleteComment,
  likeComment,
} from "./features/commentsSlice";
import { Button, Input, Skeleton } from "antd";

const SCROLL_POSITION_KEY = "scrollPosition";
const COMMENT_INPUT_KEY = "commentInput";
const COMMENT_USERNAME = "commentUsername";
const COMMENT_FULLNAME = "commentFullName";

interface User {
  id: number;
  fullName: string;
  username: string;
}

interface Comment {
  id: number;
  body: string;
  user: User;
  likes: number;
}

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { comments, loading } = useAppSelector((state) => state.comments);
  const [newComment, setNewComment] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");

  const [fadingIn, setFadingIn] = useState<number | null>(null);

  const saveScrollPosition = () => {
    const scrollPosition = window.scrollY;
    localStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(scrollPosition));
  };

  const restoreScrollPosition = () => {
    const savedPosition = localStorage.getItem(SCROLL_POSITION_KEY);
    if (savedPosition) {
      window.scrollTo(0, JSON.parse(savedPosition));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(e.target.value);
    localStorage.setItem(COMMENT_INPUT_KEY, e.target.value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    localStorage.setItem(COMMENT_USERNAME, e.target.value);
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFullName(e.target.value);
    localStorage.setItem(COMMENT_FULLNAME, e.target.value);
  };

  const restoreInputs = () => {
    const savedInput = localStorage.getItem(COMMENT_INPUT_KEY);
    const savedUsername = localStorage.getItem(COMMENT_USERNAME);
    const savedFullName = localStorage.getItem(COMMENT_FULLNAME);
    if (savedInput) setNewComment(savedInput);
    if (savedUsername) setUsername(savedUsername);
    if (savedFullName) setFullName(savedFullName);
  };

  useEffect(() => {
    dispatch(fetchComments());
    restoreScrollPosition();
    restoreInputs();
    window.addEventListener("beforeunload", saveScrollPosition);

    return () => {
      window.removeEventListener("beforeunload", saveScrollPosition);
    };
  }, [dispatch]);

  const handleAddComment = () => {
    const comment: Comment = {
      id: Date.now(),
      body: newComment,
      user: {
        id: Date.now(),
        fullName: fullName,
        username: username,
      },
      likes: 0,
    };
    dispatch(addComment(comment));
    setNewComment("");
    localStorage.removeItem(COMMENT_INPUT_KEY);

    setFadingIn(comment.id);
    setTimeout(() => {
      setFadingIn(null);
    }, 200);
  };

  const handleLikeComment = (id: number) => {
    dispatch(likeComment(id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex justify-center items-center">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Comments</h1>
        <div className="mb-4">
          <div className="flex gap-3 mb-3">
            <Input
              placeholder="FullName"
              value={fullName}
              onChange={handleFullNameChange}
            />
            <Input
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
            />
          </div>
          <input
            type="text"
            value={newComment}
            onChange={handleInputChange}
            placeholder="Add a comment..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <Button
          type="primary"
          onClick={handleAddComment}
          className="w-full mb-4"
          disabled={!newComment || !username || !fullName}
        >
          Add Comment
        </Button>

        {loading ? (
          <div className="mt-5">
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {comments.map((comment: Comment) => (
              <li
                key={comment.id}
                className={`flex justify-between items-start bg-gray-50 p-4 rounded-lg shadow-sm transition-opacity duration-200 ease-in-out ${
                  fadingIn === comment.id ? "opacity-0" : "opacity-100"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800">
                    {comment.user.fullName} (@{comment.user.username})
                  </span>
                  <p className="text-gray-800">{comment.body}</p>
                </div>
                <div className="flex flex-col md:flex-row justify-center items-center">
                  <Button
                    type="text"
                    onClick={() => handleLikeComment(comment.id)}
                  >
                    👍 {comment.likes}
                  </Button>
                  <Button
                    danger
                    type="primary"
                    size="small"
                    onClick={() => dispatch(deleteComment(comment.id))}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
