export function canLawyerHandleQuery(lawyer, query) {
  // Check if lawyer is available (workPercentage > 0)
  if (lawyer.workPercentage === 0) {
    return false;
  }

  // Check urgent queries
  if (query.isUrgent && !lawyer.canHandleUrgent) {
    return false;
  }

  // Check typologies
  if (lawyer.typologies.includes("Todo")) {
    return true;
  }

  return lawyer.typologies.some(typology => 
    query.typology.includes(typology) || typology.includes(query.typology)
  );
}

export function assignQueries(queries, lawyers) {
  const assignedQueries = [];
  const lawyerAssignments = new Map();

  // Initialize lawyer assignments
  lawyers.forEach(lawyer => {
    lawyerAssignments.set(lawyer.id, lawyer.currentAssignments || 0);
  });

  // Calculate max assignments per lawyer based on percentage
  const totalWorkCapacity = lawyers.reduce((sum, l) => sum + l.workPercentage, 0);
  const totalQueries = queries.length;

  queries.forEach(query => {
    // Check if query is already assigned to one of our lawyers
    if (query.assignedLawyer) {
      const existingLawyer = lawyers.find(l => 
        l.excelName === query.assignedLawyer || 
        l.name === query.assignedLawyer ||
        l.email === query.assignedLawyerEmail
      );
      
      if (existingLawyer && existingLawyer.workPercentage > 0) {
        // Check if it's a response or discrepancy (keep with same lawyer)
        if (query.lastAction?.toLowerCase().includes('respuesta') || 
            query.lastAction?.toLowerCase().includes('discrepancia')) {
          assignedQueries.push({
            ...query,
            assignedLawyer: existingLawyer.name,
            assignedLawyerEmail: existingLawyer.email
          });
          return;
        }
      }
    }

    // Find eligible lawyers
    const eligibleLawyers = lawyers.filter(lawyer => 
      canLawyerHandleQuery(lawyer, query)
    );

    if (eligibleLawyers.length === 0) {
      // No eligible lawyer found, keep unassigned
      assignedQueries.push(query);
      return;
    }

    // Sort by current assignments and work percentage
    eligibleLawyers.sort((a, b) => {
      const aAssignments = lawyerAssignments.get(a.id) || 0;
      const bAssignments = lawyerAssignments.get(b.id) || 0;
      
      const aRatio = aAssignments / a.workPercentage;
      const bRatio = bAssignments / b.workPercentage;
      
      return aRatio - bRatio;
    });

    // Assign to lawyer with lowest assignment ratio
    const selectedLawyer = eligibleLawyers[0];
    const currentCount = lawyerAssignments.get(selectedLawyer.id) || 0;
    lawyerAssignments.set(selectedLawyer.id, currentCount + 1);

    assignedQueries.push({
      ...query,
      assignedLawyer: selectedLawyer.name,
      assignedLawyerEmail: selectedLawyer.email,
      status: "pending"
    });
  });

  return assignedQueries;
}

export function parseExcelDate(excelDate) {
  // If it's already a valid Date
  if (excelDate instanceof Date && !isNaN(excelDate.getTime())) {
    return excelDate;
  }
  
  // If it's an Excel numeric date
  if (typeof excelDate === 'number' && excelDate > 0) {
    // Excel dates are days since 1900-01-01 (with leap year bug correction)
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  
  // If it's a string, try different parsing methods
  if (typeof excelDate === 'string' && excelDate.trim() !== '') {
    // Try ISO format first
    let date = new Date(excelDate);
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // Try dd/MM/yyyy format
    const parts = excelDate.split(/[\\/\-\.]/);
    if (parts.length === 3) {
      // Try dd/MM/yyyy
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
      const year = parseInt(parts[2], 10);
      date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
    
    // Try dd/MM/yyyy HH:mm format
    const dateTimeParts = excelDate.split(' ');
    if (dateTimeParts.length === 2) {
      const dateParts = dateTimeParts[0].split(/[\\/\-\.]/);
      const timeParts = dateTimeParts[1].split(':');
      if (dateParts.length === 3 && timeParts.length >= 2) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        date = new Date(year, month, day, hours, minutes);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
  }
  
  // Return current date as fallback for invalid dates
  console.warn('Invalid date format, using current date:', excelDate);
  return new Date();
}