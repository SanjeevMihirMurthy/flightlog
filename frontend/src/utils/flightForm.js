export const CURRENT_YEAR = new Date().getFullYear();

export const INITIAL_FORM = {
  flight_number: "", airline: "", origin_iata: "", destination_iata: "",
  departure_year: "", aircraft_type: "",
  cabin_class: "Economy", duration_minutes: "", notes: "",
};

export function getFormErrors(form) {
  const errors = {};

  if (!form.airline) errors.airline = "Please select an airline";
  if (!form.origin_iata) errors.origin_iata = "Please select an origin";
  if (!form.destination_iata) errors.destination_iata = "Please select a destination";
  if (!form.departure_year) errors.departure_year = "Please enter a year";

  if (form.origin_iata && form.destination_iata && form.origin_iata === form.destination_iata) {
    errors.destination_iata = "Origin and destination can't be the same airport";
  }

  if (form.departure_year) {
    const year = parseInt(form.departure_year, 10);
    if (!Number.isInteger(year) || year < 1919 || year > CURRENT_YEAR + 1) {
      errors.departure_year = `Enter a year between 1919 and ${CURRENT_YEAR + 1}`;
    }
  }

  if (form.flight_number && !/^[A-Za-z0-9]{2,8}$/.test(form.flight_number)) {
    errors.flight_number = "Flight number should be 2-8 letters/digits";
  }

  if (form.duration_minutes) {
    const duration = parseInt(form.duration_minutes, 10);
    if (!Number.isInteger(duration) || duration <= 0 || duration > 1440) {
      errors.duration_minutes = "Duration should be between 1 and 1440 minutes";
    }
  }

  return errors;
}
