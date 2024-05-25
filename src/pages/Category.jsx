import React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../components/Layout/Layout";
import { db } from "../firebase.config";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import Spinner from "../components/Spinner";
import ListingItems from "../components/ListingItems";

export default function Category() {
  const [listing, setListings] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastFetchListing, setLastFetchListing] = useState(null);
  const params = useParams();

  //fetch listing
  useEffect(() => {
    const fetchListing = async () => {
      try {
        //reference
        const listingsRef = collection(db, "listings");
        //query
        const q = query(
          listingsRef,
          where("type", "==", params.categoryName),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        //execute query
        const querySnap = await getDocs(q);
        const lastVisble = querySnap.docs[querySnap.docs.length - 1];
        setLastFetchListing(lastVisble);
        const listings = [];

        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        console.log(error);
        toast.error("Unable to fetch data");
      }
    };
    //function call
    fetchListing();
  }, [params.categoryName]);

  //Load More Pagination

  const fetchLoadMoreListing = async () => {
    try {
      //reference
      const listingsRef = collection(db, "listings");
      //query
      const q = query(
        listingsRef,
        where("type", "==", params.categoryName),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchListing),
        limit(10)
      );
      //execute query
      const querySnap = await getDocs(q);
      const lastVisble = querySnap.docs[querySnap.docs.length - 1];
      setLastFetchListing(lastVisble);
      const listings = [];

      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setListings((prevState) => [...prevState, ...listings]);
      setLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Unable to fetch data");
    }
  };

  return (
    <Layout>
      <div className="mt-3 container-fluid">
        <h1>
          {params.categoryName === "rent"
            ? "Places For Rent"
            : "Places For Sale"}
        </h1>
        {loading ? (
          <Spinner />
        ) : listing && listing.length > 0 ? (
          <>
            <div>
              {listing.map((list) => (
                <ListingItems listing={list.data} id={list.id} key={list.id} />
              ))}
            </div>
          </>
        ) : (
          <p>No Listing For {params.categoryName}</p>
        )}
      </div>
      <div>
        {lastFetchListing && (
          <button className="load-btn " onClick={fetchLoadMoreListing}>
            load more
          </button>
        )}
      </div>
    </Layout>
  );
}
