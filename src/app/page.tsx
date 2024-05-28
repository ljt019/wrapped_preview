"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";

interface Artist {
  id: string;
  name: string;
  images: { url: string }[];
}

interface UserInfo {
  display_name: string;
  images: { url: string }[];
}

export default function Home() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  }, [accessToken]);

  const fetchTopArtists = useCallback(async () => {
    try {
      const response = await axios.get(
        `/api/top-artists?access_token=${accessToken}`
      );
      setTopArtists(response.data.items);
    } catch (error) {
      console.error("Error fetching top artists", error);
    }
  }, [accessToken]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    if (token) {
      setAccessToken(token);
      window.history.replaceState(null, "", window.location.pathname);
    }

    if (accessToken) {
      fetchUserData();
      fetchTopArtists();
    }
  }, [accessToken, fetchTopArtists, fetchUserData]);

  return (
    <div>
      {!accessToken ? (
        <Link href="/api/login">Login with Spotify</Link>
      ) : (
        <div>
          {userInfo && (
            <div>
              <h1>Welcome, {userInfo.display_name}</h1>
              {userInfo.images[0] && (
                <Image
                  src={userInfo.images[0].url}
                  alt="User Avatar"
                  width="100"
                  height="100"
                />
              )}
            </div>
          )}
          {topArtists.length > 0 && (
            <div>
              <h2>Top 5 Artists:</h2>
              <ul>
                {topArtists.map((artist) => (
                  <li key={artist.id}>
                    {artist.images[0] && (
                      <Image
                        src={artist.images[0].url}
                        alt={artist.name}
                        width="50"
                        height="50"
                      />
                    )}
                    {artist.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
