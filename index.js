
const countryListContainer = document.getElementById("country-list");


async function fetchCountries() {
  try {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries");
    const data = await response.json();

    if (data.data && Array.isArray(data.data)) {
      const countries = data.data.map((item) => ({ name: item.country }));
      renderCheckboxes(countries, countryListContainer, "country", handleCountryClick);
    } else {
      console.error("Unexpected API response structure:", data);
    }
  } catch (error) {
    console.error("Error fetching countries:", error);
    countryListContainer.innerHTML = `<p>Failed to load countries. Please try again later.</p>`;
  }
}


async function handleCountryClick(countryName, countryElement) {
  const existingStateContainer = countryElement.querySelector(".state-container");
  if (existingStateContainer) {
    existingStateContainer.remove(); 
    return;
  }

  try {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryName })
    });
    const data = await response.json();

    if (data.data && data.data.states) {
      const states = data.data.states.map((state) => ({ name: state.name }));
      const stateContainer = document.createElement("div");
      stateContainer.classList.add("state-container", "checkbox-container");

      renderCheckboxes(states, stateContainer, "state", (stateName, stateElement) =>
        handleStateClick(countryName, stateName, stateElement)
      );
      countryElement.appendChild(stateContainer);
    } else {
      console.error("Unexpected states API response structure:", data);
    }
  } catch (error) {
    console.error("Error fetching states:", error);
  }
}


async function handleStateClick(countryName, stateName, stateElement) {
  const existingCityContainer = stateElement.querySelector(".city-container");
  if (existingCityContainer) {
    existingCityContainer.remove();
    return;
  }

  try {
    const response = await fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryName, state: stateName })
    });
    const data = await response.json();

    if (data.data && Array.isArray(data.data)) {
      const cities = data.data.map((city) => ({ name: city }));
      const cityContainer = document.createElement("div");
      cityContainer.classList.add("city-container", "checkbox-container");

      renderCheckboxes(cities, cityContainer, "city");
      stateElement.appendChild(cityContainer);
    } else {
      console.error("Unexpected cities API response structure:", data);
    }
  } catch (error) {
    console.error("Error fetching cities:", error);
  }
}


function renderCheckboxes(items, container, type, clickHandler) {
  items.forEach((item) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `${type}-${item.name}`;
    checkbox.value = item.name;

    const label = document.createElement("label");
    label.htmlFor = `${type}-${item.name}`;
    label.textContent = item.name;

    const div = document.createElement("div");
    div.appendChild(checkbox);
    div.appendChild(label);

    if (clickHandler) {
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          clickHandler(item.name, div);
        } else {
          const subContainer = div.querySelector(".state-container, .city-container");
          if (subContainer) subContainer.remove();
        }
      });
    }

    container.appendChild(div);
  });
}


fetchCountries();
