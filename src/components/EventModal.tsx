"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import { useMutation, useQueryClient } from "react-query"
import { createEvent, updateEvent } from "../api/events"
import type { Event } from "../types/Event"
import { convertLocalToUTC, convertUTCToLocal } from "../utils/timezone"

interface EventModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  event?: Event
}

const EventModal: React.FC<EventModalProps> = ({ isOpen, setIsOpen, event }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    is_public: false,
  })

  const queryClient = useQueryClient()

  const createEventMutation = useMutation(createEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries("events")
      closeModal()
    },
  })

  const updateEventMutation = useMutation(updateEvent, {
    onSuccess: () => {
      queryClient.invalidateQueries("events")
      closeModal()
    },
  })

  useEffect(() => {
    if (event) {
      const { date, time } = convertUTCToLocal(event.start_time)
      setFormData({
        title: event.title,
        description: event.description || "",
        date: date,
        time: time,
        location: event.location || "",
        is_public: event.is_public || false,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        is_public: false,
      })
    }
  }, [event])

  const closeModal = () => {
    setIsOpen(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (event) {
      const startTime = convertLocalToUTC(formData.date, formData.time)

      updateEventMutation.mutate({
        id: event.id,
        title: formData.title,
        description: formData.description,
        start_time: startTime,
        location: formData.location,
        is_public: formData.is_public,
      })
    } else {
      const startTime = convertLocalToUTC(formData.date, formData.time)

      createEventMutation.mutate({
        title: formData.title,
        description: formData.description,
        start_time: startTime,
        location: formData.location,
        is_public: formData.is_public,
      })
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {event ? "Edit Event" : "Create New Event"}
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time (IST)</label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        name="is_public"
                        checked={formData.is_public}
                        onChange={handleChange}
                        className="form-checkbox h-5 w-5 text-indigo-600"
                      />
                      <span className="ml-2 text-gray-700">Public Event</span>
                    </label>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      {event ? "Update Event" : "Create Event"}
                    </button>
                    <button
                      type="button"
                      className="ml-3 inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default EventModal
