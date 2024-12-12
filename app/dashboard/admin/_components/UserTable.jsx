"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle,
  MoreHorizontal, 
  UserCog
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserTable = ({ users }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAction = async (userId, action) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      if (!response.ok) {
        throw new Error('Failed to perform action');
      }

      // Refresh data or show success message
    } catch (error) {
      console.error(error);
      // Show error message
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Interviews</TableHead>
            <TableHead>Tests</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCog className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div>{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {user.isActive ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Active
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="w-4 h-4 mr-1" />
                    Inactive
                  </div>
                )}
              </TableCell>
              <TableCell>{user.interviews?.length || 0}</TableCell>
              <TableCell>{user.aptitudeTests?.length || 0}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>{formatDate(user.lastActive)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleAction(user.id, 'view')}
                    >
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction(user.id, user.isActive ? 'deactivate' : 'activate')}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'} User
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleAction(user.id, 'delete')}
                      className="text-red-600"
                    >
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
