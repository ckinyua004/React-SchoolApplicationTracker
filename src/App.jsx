import { useState, useEffect } from 'react'
import {
  DndContext,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import './App.css'

export default function App() {
  const [ applicationData, setApplicationData ] = useState(() => {
    try {
      const savedApplications = localStorage.getItem('applications')

      if(!savedApplications) return []

      const parsedApplications = JSON.parse(savedApplications)

      return Array.isArray(parsedApplications)
        ? parsedApplications
        : []
    } catch(err) {
      console.error("Could not load applications:", err)
      return []
    }
  })

  useEffect(() => {
    try{
      localStorage.setItem(
        'applications',
        JSON.stringify(applicationData)
      )
    } catch(err) {
      console.error("Could not save applications: ", err)
    }
  }, [applicationData])

  const [ currentView, setCurrentView ] = useState('allApplications')

  return (
    <>
    <Header />
    <div>
      <button className={currentView === 'allApplications' ? 'active' : ''} onClick={() => setCurrentView('allApplications')}>All Applications</button>
      <button className={currentView === 'statusBoard' ? 'active' : ''} onClick={() => setCurrentView('statusBoard')}>Application Status Board</button>
    </div>
    <div>
      { currentView === 'allApplications' && <AllApplications applicationData={applicationData} setApplicationData={setApplicationData}/> }
      { currentView === 'statusBoard' && <ApplicationKanbanBoard applicationData={applicationData} setApplicationData={setApplicationData}/> }
    </div>
    </>
  )
}

const STATUSES = [
  { value: 'bookmarked', label: 'Bookmarked', color: '#1479b3' },
  { value: 'applying', label: 'Applying', color: '#dcd519' },
  { value: 'applied', label: 'Applied', color: '#e08a1a' },
  { value: 'offerReceived', label: 'Offer received', color: '#08b119' },
  { value: 'interview', label: 'Interview', color: '#a472ca' },
  { value: 'rejected', label: 'Rejected', color: '#ef4721' },
];

const Header = () => {
  return (
    <div className='header'>
      <h1>University Application Tracker.</h1>
    </div>
  )
}

const AllApplications = ({applicationData, setApplicationData}) => {
  return (
    <div>
      <Analytics applicationData={applicationData}/>
      <ManageApplications setApplicationData={setApplicationData}/>
      <ApplicationManager applicationData={applicationData} setApplicationData={setApplicationData}/>
    </div>
  )
}

const Analytics = ({applicationData}) => {
  const statusLink = ['bookmarked', 'applying', 'applied', 'interview', 'offerReceived', 'rejected']

  const applications = Array.isArray(applicationData)
    ? applicationData
    : []

  return (
    <div className='analytics'>
        {statusLink.map((status, index) => (
          <div key={index}>
            <h3>{applications.filter(item => item.applicationStatus === status).length}</h3>
            <h3>{status}</h3>
          </div>
        ))}
    </div>
  )
}

const ManageApplications = ({ setApplicationData}) => {
  const [ showInputModal, setShowInputModal ] = useState(false);

  return(
    <div className='mApplications'>
      {/* <div>
        <button>Search</button>
      </div> */}
      <div>
        <button onClick={() => setShowInputModal(true)}>+ Add application</button>
        {showInputModal && (
          <InputModal setApplicationData={setApplicationData} setShowInputModal={setShowInputModal} />
        )}
      </div>
    </div>
  )
}

const ApplicationManager = ({ applicationData, setApplicationData }) => {
  const [ selectedIds, setSelectedIds] = useState([])

  const statuses = [
    'bookmarked', 'applying', 'applied', 'offerReceived', 'interview', 'rejected'
  ]

  const toggle = (id) =>
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    )

  const updateStatus = (status) => {
    setApplicationData(prev =>
      prev.map(application =>
        selectedIds.includes(application.id)
          ? { ...application, applicationStatus: status }
          : application
      )
    )

    setSelectedIds([]);
  };

  const deleteSelectedID = () => {
    setApplicationData(prev =>
      prev.filter(a => !selectedIds.includes(a.id))
    )

    setSelectedIds([])
  }

  return(
    <div>
      <span>{selectedIds.length} selected</span>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger className='btn' disabled={!selectedIds.length}>
          Manage selected
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className='menu' sideOffset={6}>
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger className='item'>
                Status
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent className='menu'>
                  {statuses.map(s => (
                    <DropdownMenu.Item key={s} className='item' onSelect={() => updateStatus(s)}>
                      {s}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>

            <DropdownMenu.Separator className='sep'/>
            <DropdownMenu.Item className='item danger' onSelect={() => deleteSelectedID()}>
              Delete application
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <ApplicationsTable applicationData={applicationData} selectedIds={selectedIds} toggle={toggle}/>
    </div>
  )
}

const InputModal = ({setApplicationData, setShowInputModal}) => {
  const getLocalDate = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60_000;

    return new Date(now.getTime() - offset)
      .toISOString()
      .slice(0, 10);
  };

  const [ formData, setFormData ] = useState({
    schoolName: '',
    course: '',
    location: '',
    applicationDate: getLocalDate(),
    applicationStatus: '',
    applicationLink: '',
    contactPersonName: '',
    contact: '',
    deadline: '',
    notes: '',
    excitement: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prevData =>({
      ...prevData,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newInputData = {
      id: crypto.randomUUID(),
      ...formData
    }

    setApplicationData(prevApplication => [
      ...prevApplication,
      newInputData
    ])

    setFormData({
      schoolName: '',
      course: '',
      location: '',
      applicationDate: getLocalDate(),
      applicationStatus: '',
      applicationLink: '',
      contactPersonName: '',
      contact: '',
      deadline: '',
      notes: '',
      excitement: '',
    })

    setShowInputModal(false)
  }

  return(
    <div className='modal-overlay'>
    <div className='modal-content'>
      <form onSubmit={handleSubmit}>
        <h2>Add a new application</h2>
        <input
          name='schoolName'
          placeholder='School Name'
          value={formData.schoolName}
          onChange={handleChange}
          required
        />

        <input 
          name='course'
          placeholder='Course name'
          value={formData.course}
          onChange={handleChange}
          required
        />
        <input
          name="location"
          placeholder="University location"
          value={formData.location}
          onChange={handleChange}
          required
        />
        <label>Application date:
          <input 
            name='applicationDate'
            type='date'
            value={formData.applicationDate}
            onChange={handleChange}
          />
        </label>

        <select 
          name='applicationStatus'
          value={formData.applicationStatus}
          onChange={handleChange}
          required
        >
          <option value='' disabled>Select application status</option>
          <option value='bookmarked'>Bookmarked</option>
          <option value='applying'>Applying/In progress</option>
          <option value='applied'>Applied</option>
          <option value='offerReceived'>Offer received</option>
          <option value='interview'>Interview</option>
          <option value='rejected'>Rejected</option>
        </select>

        <input 
          name='applicationLink'
          type='url'
          placeholder='https://www.example.com'
          value={formData.applicationLink}
          onChange={handleChange}
          required
        />

        <input 
          name='contactPersonName'
          placeholder='Contact person'
          value={formData.contactPersonName}
          onChange={handleChange}
        />

        <input 
          name='contact'
          placeholder='Contact email/phone'
          value={formData.contact}
          onChange={handleChange}
        />

        <label>Deadline:
          <input 
            name='deadline'
            type='date'
            value={formData.deadline}
            onChange={handleChange}
            required
          />
        </label>

        <input 
          name='notes'
          placeholder='notes'
          value={formData.notes}
          onChange={handleChange}
        />

        <select
          name='excitement'
          value={formData.excitement}
          onChange={handleChange}
        >
          <option value='' disabled>Select excitement level</option>
          <option value='high'>High</option>
          <option value='medium'>Medium</option>
          <option value='low'>Low</option>
        </select>
 
        <button type='submit' >Submit</button>
        <button type='button' onClick={() => setShowInputModal(false)}>Cancel</button>
      </form>
    </div>
    </div>
  )
}

const ApplicationsTable = ({
  applicationData,
  selectedIds,
  toggle,
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  const headers = [
    { label: 'School name', key: 'schoolName' },
    { label: 'Course', key: 'course' },
    { label: 'Location', key: 'location' },
    { label: 'Application date', key: 'applicationDate' },
    { label: 'Application status', key: 'applicationStatus' },
    { label: 'Application link', key: 'applicationLink' },
    { label: 'Contact person', key: 'contactPersonName' },
    { label: 'Contact email/phone', key: 'contact' },
    { label: 'Deadline', key: 'deadline' },
    { label: 'Notes', key: 'notes' },
    { label: 'Excitement', key: 'excitement' },
  ];

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc'
          ? 'desc'
          : 'asc',
    }));
  };

  const sortedApplications = [...applicationData].sort((a, b) => {
    if (sortConfig.key === null) return 0;

    const aValue = String(a[sortConfig.key] ?? '');
    const bValue = String(b[sortConfig.key] ?? '');

    const comparison = aValue.localeCompare(
      bValue,
      undefined,
      { numeric: true, sensitivity: 'base' }
    );

    return sortConfig.direction === 'asc'
      ? comparison
      : -comparison;
  });

  return (
    <div className="table-container">
    <table>
      <thead>
        <tr>
          <th></th>

          {headers.map(({ label, key }) => (
            <th key={key}>
              <button
                type="button"
                onClick={() => handleSort(key)}
                aria-label={`Sort by ${label}`}
              >
                {label}

                {sortConfig.key === key && (
                  <span>
                    {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                  </span>
                )}
              </button>
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {sortedApplications.map(item => (
          <tr key={item.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggle(item.id)}
                aria-label={`Select ${item.schoolName}`}
              />
            </td>

            {headers.map(({ key }) => (
              <td key={key}>
                {key === 'applicationLink' && item[key] ? (
                  <a
                    href={item[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item[key]}
                  </a>
                ) : (
                  item[key] ?? ''
                )}
              </td>
            ))}
          </tr>
        ))}

        {sortedApplications.length === 0 && (
          <tr>
            <td colSpan={headers.length + 1}>
              No applications yet. Add an application to get started.
            </td>
          </tr>
        )}
      </tbody>
    </table>
    </div>
  );
};

const ApplicationKanbanBoard = ({
  applicationData,
  setApplicationData,
}) => {
  const handleDragEnd = ({ active, over }) => {
    // Ignore drops outside a status column
    if (!over) return;

    const applicationId = String(active.id);
    const targetId = String(over.id);

    // Our columns use IDs such as "status:applied"
    if (!targetId.startsWith('status:')) return;

    const newStatus = targetId.slice('status:'.length);

    setApplicationData(prev =>
      prev.map(application =>
        application.id === applicationId
          ? {
              ...application,
              applicationStatus: newStatus,
            }
          : application
      )
    );
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="status-board">
        {STATUSES.map(({ value, label, color }) => (
          <StatusColumn
            key={value}
            status={value}
            label={label}
            style={{ '--status': color }}
            color={color}
            applications={applicationData.filter(
              item => item.applicationStatus === value
            )}
          />
        ))}
      </div>
    </DndContext>
  );
};

const StatusColumn = ({
  status,
  label,
  color,
  applications,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `status:${status}`,
  });

  return (
    <section
      ref={setNodeRef}
      className={`status-column ${isOver ? 'is-over' : ''}`}
    >
      <div className="status-column-header">
        <span
          className="status-dot"
          style={{ backgroundColor: color }}
        />
        <h2>{label}</h2>
        <span className="status-count">
          {applications.length}
        </span>
      </div>

      <div className="status-cards">
        {applications.map(application => (
          <DraggableApplicationCard
            key={application.id}
            application={application}
          />
        ))}

        {applications.length === 0 && (
          <p className="empty-column">
            Drop an application here
          </p>
        )}
      </div>
    </section>
  );
};

const DraggableApplicationCard = ({ application }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: application.id,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="application-card"
      {...listeners}
      {...attributes}
    >
      <h3>{application.schoolName}</h3>
      <p>{application.course}</p>
      <p>{application.location}</p>
      <small>
        Deadline: {application.deadline || 'Not specified'}
      </small>
    </article>
  );
};
