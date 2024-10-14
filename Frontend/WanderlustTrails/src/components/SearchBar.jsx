import React from 'react'
import { Button, Form } from 'react-bootstrap'

function SearchBar() {
  return (
    <div>
        {/* Search Bar */}
        <Form className="d-flex me-auto">
          <Form.Control
            type="search"
            placeholder="Search..."
            className="border border-gray-300 rounded-md px-3 py-2 lg:mr-4 lg:w-64"
            aria-label="Search"
          />
          <Button variant="outline" className="border-orange-700 text-orange-700 hover:bg-orange-700 hover:text-white transition-all duration-200"
          >Search
          </Button>
        </Form>

    </div>
  )
}

export default SearchBar