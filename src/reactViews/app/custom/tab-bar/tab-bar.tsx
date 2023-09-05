import './tab-bar.scss';

export enum QueryTabs {
  Table = "Table",
  JSON = "JSON",
  PLAN = "Plan",
}

export const TAB_BAR_ITEMS = [
  { label: QueryTabs.JSON, key: QueryTabs.JSON },
  { label: QueryTabs.Table, key: QueryTabs.Table },
  { label: QueryTabs.PLAN, key: QueryTabs.PLAN },
];

// TabBarMenu component
export const TabBarMenu = ({ items, value, onChange }) => (
  <div className="tab-bar">
    {items.map((item) => (
      <button
        key={item.key}
        className={`tab ${value === item.key ? "active" : ""}`}
        onClick={() => onChange(item.key)}
      >
        {item.label}
      </button>
    ))}
  </div>
);
