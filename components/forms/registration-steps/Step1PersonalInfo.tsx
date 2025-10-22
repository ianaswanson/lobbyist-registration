"use client";

interface Step1Props {
  data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    hoursCurrentQuarter: number;
  };
  updateData: (data: any) => void;
  onNext: () => void;
}

export function Step1PersonalInfo({ data, updateData, onNext }: Step1Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          Step 1: Personal Information
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Please provide your contact information as a lobbyist.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            id="email"
            required
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="john.doe@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            required
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="(503) 555-0100"
          />
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Mailing Address <span className="text-red-600">*</span>
          </label>
          <textarea
            id="address"
            required
            rows={3}
            value={data.address}
            onChange={(e) => updateData({ address: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
            placeholder="123 Main Street&#10;Portland, OR 97201"
          />
        </div>

        <div>
          <label
            htmlFor="hoursCurrentQuarter"
            className="block text-sm font-medium text-gray-700"
          >
            Estimated Hours Spent Lobbying This Quarter{" "}
            <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="hoursCurrentQuarter"
            required
            min="0"
            step="0.5"
            value={data.hoursCurrentQuarter}
            onChange={(e) =>
              updateData({ hoursCurrentQuarter: parseFloat(e.target.value) })
            }
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Note: Registration is required if you exceed 10 hours per quarter
            (excluding travel time).
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          Next: Employer Information
        </button>
      </div>
    </form>
  );
}
