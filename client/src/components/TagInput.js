import React, { useState } from 'react';
import { X } from 'lucide-react';
import './TagInput.css';

function TagInput({ tags = [], onTagsChange, placeholder = 'Type and press Enter' }) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove) => {
    onTagsChange(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="tag-input-container">
      <div className="tags-wrapper">
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="tag-remove"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="tag-input"
        />
      </div>
      <small className="tag-hint">Press Enter after every skill</small>
    </div>
  );
}

export default TagInput;
