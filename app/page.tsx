"use client";

import { useState } from "react";
import axios from "axios";

async function getMoviesFromMood(mood: string) {
  const response = await fetch("http://127.0.0.1:8000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood }),
  });

  const data = await response.json();
  return data.movies;
}

export default function Home() {
  const [mood, setMood] = useState("");
  const [movies, setMovies] = useState([]);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await getMoviesFromMood(mood);
    setMovies(result);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Mood2Movie 🎬</h1>
      <form onSubmit={handlePredict}>
        <input
          className="border p-2"
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Enter your mood"
        />
        <button type="submit" className="ml-2 px-4 py-2 bg-blue-500 text-white">
           Get Movies
        </button>
      </form>
      <ul className="mt-4">
        {movies}
      </ul>
    </div>
  );
}





/*{movies.map((movie, index) => (
  <li key={index} className="text-lg">{movie}*/