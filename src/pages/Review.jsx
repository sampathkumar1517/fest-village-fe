import { useState } from "react";
import "./review.css";

const Review = () => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // send feedback to developer
    console.log("Feedback received:", feedback);
    alert("Thanks for your feedback!");
    setFeedback("");
  };

  return (
    <div className="page review-page">
      <h2>Review &amp; Suggestions</h2>
      <form onSubmit={handleSubmit} className="review-form">
        <label>
          What would you like implemented next?
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            required
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Review;
