const ThumbsDownIcon = (props) => {
    return (
        <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        {...props}
      >
        <g
          stroke="#325a9a"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        >
          <path d="M21 14a1 1 0 0 1-1 1h-3V3h3a1 1 0 0 1 1 1v10ZM17 13V5l-1.992-1.328A4 4 0 0 0 12.788 3H7.542a3 3 0 0 0-2.959 2.507L3.388 12.67A2 2 0 0 0 5.361 15H10" />
          <path d="m10 15-.687 3.436a1.807 1.807 0 0 0 1.2 2.068v0a1.807 1.807 0 0 0 2.188-.906L16 13h1" />
        </g>
      </svg>    );
  };
  
  export default ThumbsDownIcon;