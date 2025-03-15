import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles.css";

const App = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDebriefModal, setShowDebriefModal] = useState(false);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [eventId, setEventId] = useState("");
  const [debriefs, setDebriefs] = useState({});

  useEffect(() => {
    if (selectedDate) {
      const fetchDebriefs = async () => {
        try {
          const response = await fetch(
            `https://kafjfxnnomulfkbykszj.supabase.co/rest/v1/debriefs?date_of_fight=eq.${selectedDate.slice(
              0,
              4
            )}-${selectedDate.slice(4, 6)}-${selectedDate.slice(6, 8)}`,
            {
              headers: {
                apikey:
                  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZmpmeG5ub211bGZrYnlrc3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNTU4OTQsImV4cCI6MjA1NjczMTg5NH0.H3DYctt1JGLeWwh7Sdq7ZACAXXfD4zH9o631jrg6lrE",
                Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZmpmeG5ub211bGZrYnlrc3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNTU4OTQsImV4cCI6MjA1NjczMTg5NH0.H3DYctt1JGLeWwh7Sdq7ZACAXXfD4zH9o631jrg6lrE`,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to fetch debriefs");
          const data = await response.json();
          setDebriefs({ [selectedDate]: data });
        } catch (error) {
          console.error("Error fetching debriefs:", error);
        }
      };
      fetchDebriefs();
    }
  }, [selectedDate]);

  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
    const calendar = [];
    let date = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDay) || date > lastDate) {
          week.push(<td key={`${i}-${j}`}></td>);
        } else {
          const fullDate = `${String(currentMonth + 1).padStart(
            2,
            "0"
          )}${String(date).padStart(2, "0")}${currentYear
            .toString()
            .slice(-2)}`;
          const hasDebrief = debriefs[fullDate]?.length > 0;
          week.push(
            <td
              key={`${i}-${j}`}
              data-date={fullDate}
              onClick={() => handleDateClick(fullDate)}
              className={selectedDate === fullDate ? "table-active" : ""}
              style={{ cursor: "pointer" }}
            >
              <span className="d-block mb-2">{date}</span>
              <div className="event-labels">
                {hasDebrief && (
                  <span className="badge bg-primary">Debrief</span>
                )}
              </div>
            </td>
          );
          date++;
        }
      }
      calendar.push(<tr key={i}>{week}</tr>);
    }
    return calendar;
  };

  const handleDateClick = (fullDate) => {
    setSelectedDate(fullDate);
    setShowDebriefModal(true);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    if (currentMonth === 0) setCurrentYear((year) => year - 1);
    setSelectedDate(null);
    setShowDebriefModal(false);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    if (currentMonth === 11) setCurrentYear((year) => year + 1);
    setSelectedDate(null);
    setShowDebriefModal(false);
  };

  const handleAddNewEvent = () => {
    if (!selectedDate) {
      alert("Please select a date first!");
      return;
    }
    setShowDebriefModal(false);
    setShowNewEventModal(true);
    setEventId(`${selectedDate}.DefaultFight.1`);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setShowDebriefModal(false);
    setShowNewEventModal(true);
    setEventId(`${selectedDate}.${type}.1`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) {
      alert("Please select a fight type.");
      return;
    }

    console.log("Submitting form...");

    const formData = new FormData(e.target);
    const debriefData = {
      event_id: eventId,
      type: selectedType,
      timestamp:
        formData.get("new-timestamp") || new Date().toISOString().slice(0, 16),
      date_of_fight:
        formData.get("new-date-of-occurrence") ||
        new Date().toISOString().slice(0, 10),
      time_of_fight:
        formData.get("new-time-of-occurrence") ||
        new Date().toISOString().slice(11, 16),
      raised_voices: formData.get("new-raised-voices") === "on",
      triggers_identified: formData.get("new-triggers-identified") === "on",
      listening_attempted: formData.get("new-listening-attempted") === "on",
      timeout_taken: formData.get("new-timeout-taken") === "on",
      apology_offered: formData.get("new-apology-offered") === "on",
      calm_discussion: formData.get("new-calm-discussion") === "on",
      compromise_reached: formData.get("new-compromise-reached") === "on",
      action_plan: formData.get("new-action-plan") === "on",
      i_statements: formData.get("new-i-statements") === "on",
      validation: formData.get("new-validation") === "on",
      timeout_signal: formData.get("new-timeout-signal") === "on",
      comments: formData.get("new-comm-comments") || null,
      reflections: formData.get("new-reflections") || null,
    };

    console.log("Debrief data:", debriefData);

    try {
      const response = await fetch(
        "https://kafjfxnnomulfkbykszj.supabase.co/rest/v1/debriefs",
        {
          method: "POST",
          headers: {
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZmpmeG5ub211bGZrYnlrc3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNTU4OTQsImV4cCI6MjA1NjczMTg5NH0.H3DYctt1JGLeWwh7Sdq7ZACAXXfD4zH9o631jrg6lrE",
            Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthZmpmeG5ub211bGZrYnlrc3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExNTU4OTQsImV4cCI6MjA1NjczMTg5NH0.H3DYctt1JGLeWwh7Sdq7ZACAXXfD4zH9o631jrg6lrE`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify(debriefData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`Failed to save debrief: ${errorText}`);
      }

      const savedDebrief = await response.json();
      console.log("Saved debrief:", savedDebrief);
      alert("Debrief saved successfully!");

      setDebriefs((prev) => {
        const updated = { ...prev };
        if (!updated[selectedDate]) updated[selectedDate] = [];
        updated[selectedDate].push(savedDebrief[0]);
        return updated;
      });

      setShowNewEventModal(false);
    } catch (error) {
      console.error("Error saving debrief:", error);
      alert("Failed to save debrief. Check the console for details.");
    }
  };

  return (
    <div id="calendar-container">
      <h1 className="text-center mb-4">EVERBOND Fight Debrief</h1>
      <h2 className="mt-4">Fight Types</h2>
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-12">
          <button
            className="debrief-btn btn btn-danger w-100"
            disabled={!selectedDate}
            onClick={() => handleTypeSelect("Major Argument")}
          >
            <i className="bi bi-exclamation-triangle-fill"></i> Major Argument
          </button>
        </div>
        <div className="col-md-4 col-12">
          <button
            className="debrief-btn btn btn-warning w-100"
            disabled={!selectedDate}
            onClick={() => handleTypeSelect("Miscommunication")}
          >
            <i className="bi bi-chat-left-dots"></i> Miscommunication
          </button>
        </div>
        <div className="col-md-4 col-12">
          <button
            className="debrief-btn btn btn-info w-100"
            disabled={!selectedDate}
            onClick={() => handleTypeSelect("Silent Treatment")}
          >
            <i className="bi bi-volume-mute"></i> Silent Treatment
          </button>
        </div>
      </div>
      <div className="d-flex justify-content-between mb-4">
        <button
          className="btn btn-outline-secondary btn-lg"
          onClick={handlePrevMonth}
        >
          <i className="bi bi-chevron-left"></i> Prev
        </button>
        <h3 id="month-year" className="mb-0">
          {new Date(currentYear, currentMonth).toLocaleString("default", {
            month: "long",
          })}{" "}
          {currentYear}
        </h3>
        <button
          className="btn btn-outline-secondary btn-lg"
          onClick={handleNextMonth}
        >
          Next <i className="bi bi-chevron-right"></i>
        </button>
      </div>
      <table id="calendar" className="table table-bordered">
        <thead>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody id="calendar-body">{generateCalendar()}</tbody>
      </table>

      <h2 className="mt-4">
        Selected Date{" "}
        <span id="selected-date-display">
          {selectedDate
            ? `(${new Date(
                currentYear,
                currentMonth,
                parseInt(selectedDate.slice(2, 4))
              ).toLocaleDateString()})`
            : ""}
        </span>
      </h2>

      <h2 className="mt-4">Past Fight Debriefs</h2>
      <ul id="event-list" className="list-group">
        {selectedDate &&
          debriefs[selectedDate]?.map((debrief, index) => (
            <li key={index} className="list-group-item">
              {debrief.type} - {new Date(debrief.timestamp).toLocaleString()}
            </li>
          ))}
      </ul>

      <Modal show={showDebriefModal} onHide={() => setShowDebriefModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Fight Debrief Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="instructions">
            <h6>Instructions:</h6>
            <p>1. Click on a date in the calendar.</p>
            <p>2. Choose fight type.</p>
            <p>
              <strong>Note:</strong> Be honest and respectful during the debrief
              process.
            </p>
          </div>
          <div id="event-details-display">
            {selectedDate && debriefs[selectedDate]?.length > 0 ? (
              <p>{debriefs[selectedDate].length} debrief(s) recorded</p>
            ) : (
              <p>No debriefs for this date yet.</p>
            )}
          </div>
          <div className="mt-3">
            <Button
              variant="success"
              className="w-100"
              onClick={handleAddNewEvent}
            >
              Add New Debrief
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showNewEventModal}
        onHide={() => setShowNewEventModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Add New Fight Debrief {selectedType ? `(${selectedType})` : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <input
              type="hidden"
              name="eventType"
              value={selectedType || "DefaultFight"}
            />
            <div className="mb-3">
              <label htmlFor="new-event-id" className="form-label">
                Debrief ID
              </label>
              <input
                type="text"
                className="form-control"
                id="new-event-id"
                value={eventId}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="new-timestamp" className="form-label">
                Debrief Timestamp
              </label>
              <input
                type="datetime-local"
                className="form-control"
                id="new-timestamp"
                defaultValue={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="new-date-of-occurrence" className="form-label">
                Date of Fight
              </label>
              <input
                type="date"
                className="form-control"
                id="new-date-of-occurrence"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="new-time-of-occurrence" className="form-label">
                Time of Fight
              </label>
              <input
                type="time"
                className="form-control"
                id="new-time-of-occurrence"
                defaultValue={new Date().toISOString().slice(11, 16)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Fight Assessment</label>
              <div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="new-raised-voices"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="new-raised-voices"
                  >
                    Raised voices
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="new-triggers-identified"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="new-triggers-identified"
                  >
                    Triggers identified
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="new-listening-attempted"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="new-listening-attempted"
                  >
                    Active listening attempted
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="new-timeout-taken"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="new-timeout-taken"
                  >
                    Timeout taken
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="new-apology-offered"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="new-apology-offered"
                  >
                    Apology offered
                  </label>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Resolution Steps</label>
              <div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="new-calm-discussion"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="new-calm-discussion"
                  >
                    Had a calm follow-up discussion
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="new-compromise-reached"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="new-compromise-reached"
                  >
                    Reached a compromise
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="new-action-plan"
                  />
                  <label className="form-check-label" htmlFor="new-action-plan">
                    Created an action plan
                  </label>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Communication Tools Used</label>
              <div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="new-i-statements"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="new-i-statements"
                  >
                    "I" statements
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="new-validation"
                  />
                  <label className="form-check-label" htmlFor="new-validation">
                    Validation of feelings
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="new-timeout-signal"
                  />
                  <label
                    className="form-check-label"
                    htmlFor="new-timeout-signal"
                  >
                    Timeout signal
                  </label>
                </div>
                <div className="mb-3">
                  <label htmlFor="new-comm-comments" className="form-label">
                    Comments
                  </label>
                  <textarea
                    className="form-control"
                    id="new-comm-comments"
                    rows="2"
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="new-reflections" className="form-label">
                Reflections & Next Steps
              </label>
              <textarea
                className="form-control"
                id="new-reflections"
                rows="3"
                placeholder="What did you learn? How will you handle similar situations in the future?"
              ></textarea>
            </div>
            <Button type="submit" variant="primary" className="w-100 mt-3">
              Submit Debrief
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default App;
