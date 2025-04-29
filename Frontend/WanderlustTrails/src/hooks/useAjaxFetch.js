// src/hooks/useAjaxFetch.js
import { useState, useEffect } from "react";
import $ from "jquery";
import { toast } from "react-toastify";

const useAjaxFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      setError(null);
      $.ajax({
        url,
        type: options.method || "GET",
        dataType: "json",
        contentType: "application/json",
        data: options.data ? JSON.stringify(options.data) : null,
        timeout: 5000,
        crossDomain: true,
        success: function (response) {
          if (response.success !== false) {
            setData(response);
          } else {
            setError(response.message || "Failed to fetch data");
            toast.error(response.message || "Failed to fetch data");
          }
        },
        error: function (xhr) {
          let errorMessage = "Server error";
          try {
            const response = JSON.parse(xhr.responseText);
            errorMessage = response.message || "Server error";
          } catch (e) {
            errorMessage = xhr.statusText || "Server error";
          }
          setError(errorMessage);
          toast.error(errorMessage);
        },
        complete: function () {
          setLoading(false);
        },
      });
    };
    fetchData();
  }, [url, options.method, options.data]);

  return { data, loading, error };
};

export default useAjaxFetch;