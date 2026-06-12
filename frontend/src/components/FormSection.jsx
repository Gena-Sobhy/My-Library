import React from "react";

const FormSection = ({ title, fields, formData, handleChange, Styling }) => {
  return (
    <div>
      <div>
        <h1 htmlFor="title" className="text-gray-400 text-xl sm:text-2xl mb-6 ">
          {title}
        </h1>
        {fields.map((field) => (
          <div
            key={field.name}
            className={
              Styling ||
              "flex flex-col sm:grid sm:grid-cols-[150px_1fr] sm:items-center gap-1.5 sm:gap-4 mb-4"
            }
          >
            <label className="text-indigo-500 font-bold text-sm sm:text-base">
              {field.label}
            </label>

            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="bg-gray-900 w-full p-2 rounded-lg text-white border border-gray-600 focus:outline-none focus:border-indigo-500 transition-colors "
              >
                {field.options.map((option) => (
                  <option
                    key={option}
                    value={option}
                    className="bg-gray-900 text-white hover:bg-indigo-500 hover:text-white"
                  >
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                key={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.label}
                className="bg-gray-900 w-full p-2 rounded-lg text-white placeholder-gray-500 border border-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormSection;
