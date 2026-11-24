import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

const names = new Intl.DisplayNames(["en"], { type: "region" });
const flags = import.meta.glob<string>("/node_modules/country-flag-icons/3x2/*.svg", {
  query: "?url&no-inline",
  import: "default",
  eager: true,
});
const countryOptions = getCountries()
  .map((code) => ({
    code,
    name: names.of(code) ?? code,
    dial: getCountryCallingCode(code),
    flag: flags[`/node_modules/country-flag-icons/3x2/${code}.svg`],
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export function InternationalPhoneField({
  country,
  value,
  invalid,
  onCountry,
  onChange,
}: {
  country: CountryCode;
  value: string;
  invalid: boolean;
  onCountry: (country: CountryCode) => void;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const phone = useRef<HTMLInputElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const searchBox = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState(0);
  const selected = countryOptions.find((option) => option.code === country)!;
  const query = search.trim().toLowerCase();
  const matches = countryOptions.filter(
    (option) =>
      option.name.toLowerCase().includes(query) ||
      (/^\+?\d+$/.test(query) && option.dial.startsWith(query.replace(/^\+/, ""))),
  );
  useEffect(() => {
    if (open) searchBox.current?.focus();
  }, [open]);

  function pick(code: CountryCode) {
    onCountry(code);
    phone.current?.focus();
    setOpen(false);
  }

  function handleSearchKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      toggle.current?.focus();
      setOpen(false);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (matches[active]) pick(matches[active].code);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!matches.length) return;
      const next =
        (active + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
      setActive(next);
      document.getElementById(`${id}-${matches[next].code}`)?.scrollIntoView({ block: "nearest" });
    }
  }

  return (
    <div
      className="booking-phone"
      onBlur={(event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !event.currentTarget.contains(event.relatedTarget)
        )
          setOpen(false);
      }}
    >
      <button
        type="button"
        className="booking-phone__country"
        ref={toggle}
        aria-label={`Country code: ${selected.name} +${selected.dial}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-countries` : undefined}
        onClick={() => {
          setOpen(!open);
          setSearch("");
          setActive(0);
        }}
      >
        {selected.flag ? <img src={selected.flag} alt="" width="21" height="14" /> : null}+
        {selected.dial} <span aria-hidden="true">▾</span>
      </button>
      <input
        id="phoneNumber"
        name="phoneNumber"
        type="tel"
        autoComplete="tel-national"
        ref={phone}
        placeholder="Phone number"
        maxLength={40}
        required
        value={value}
        aria-invalid={invalid}
        aria-describedby="phoneNumber-help phoneNumber-error"
        onChange={(event) => onChange(event.target.value)}
      />
      {open ? (
        <div className="booking-phone__picker">
          <input
            type="text"
            role="combobox"
            aria-label="Search countries or calling codes"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls={`${id}-countries`}
            aria-activedescendant={matches[active] ? `${id}-${matches[active].code}` : undefined}
            placeholder="Country or code"
            autoComplete="off"
            ref={searchBox}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setActive(0);
            }}
            onKeyDown={handleSearchKey}
          />
          <ul role="listbox" aria-label="Countries" id={`${id}-countries`}>
            {matches.map((option, index) => (
              <li
                key={option.code}
                id={`${id}-${option.code}`}
                role="option"
                aria-selected={active === index}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => pick(option.code)}
              >
                {option.flag ? (
                  <img src={option.flag} alt="" width="21" height="14" loading="lazy" />
                ) : null}
                {option.name} +{option.dial}
              </li>
            ))}
          </ul>
          {!matches.length ? <p role="status">No countries found.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
