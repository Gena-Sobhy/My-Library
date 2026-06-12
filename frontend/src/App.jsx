import React from "react";
import { Navbar, AddBook, BookSearch } from "./components";
import {
  Hero,
  AddBookForm,
  BookInfo,
  MyShelf,
  ExploreCollections,
  SeachBook,
} from "./pages";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter basename="/My-Library/">
      <Navbar />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/add-book" element={<AddBookForm />} />
        <Route path="/search-book" element={<SeachBook />} />
        <Route path="/book-info" element={<BookInfo />} />
        <Route path="/my-shelf" element={<MyShelf />} />
        <Route path="/explore" element={<ExploreCollections />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
